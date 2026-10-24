import { and, desc, eq, inArray, isNull, lt } from 'drizzle-orm';

import { db } from '@/core/db';
import { atomic, AtomicGuardError, guard } from '@/core/db/atomic';
import { aiTask, credit } from '@/config/db/schema';
import { planConsume, planRevoke } from '@/modules/credits/service';
import { getUuid } from '@/lib/hash';

export enum AITaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

const NON_TERMINAL_STATUSES = [AITaskStatus.PENDING, AITaskStatus.PROCESSING];

async function taskRevokePlan(task: any) {
  let creditId = task.creditId;
  if (!creditId && task.taskInfo) {
    try {
      creditId = JSON.parse(task.taskInfo).creditId;
    } catch {
      /* legacy malformed metadata: use the consumption lookup below */
    }
  }
  if (!creditId && task.costCredits > 0) {
    const [record] = await db()
      .select({ id: credit.id })
      .from(credit)
      .where(
        and(
          eq(credit.userId, task.userId),
          eq(credit.transactionType, 'consume'),
          eq(credit.metadata, JSON.stringify({ taskId: task.id }))
        )
      )
      .limit(1);
    creditId = record?.id;
  }
  return creditId ? planRevoke(creditId) : undefined;
}

export async function expireTaskIfNeeded(
  taskId: string,
  timeoutMs = 20 * 60 * 1000
) {
  const [task] = await db()
    .select()
    .from(aiTask)
    .where(eq(aiTask.id, taskId))
    .limit(1);
  if (
    !task ||
    task.deletedAt ||
    !NON_TERMINAL_STATUSES.includes(task.status as AITaskStatus) ||
    Date.now() - new Date(task.createdAt).getTime() <= timeoutMs
  )
    return false;
  const plan = await taskRevokePlan(task);
  try {
    await atomic((q) => [
      guard({
        table: aiTask,
        column: 'userId',
        where: eq(aiTask.id, taskId),
        require: and(
          inArray(aiTask.status, NON_TERMINAL_STATUSES),
          isNull(aiTask.deletedAt)
        )!,
        message: 'Task already finished',
      }),
      q
        .update(aiTask)
        .set({ status: AITaskStatus.FAILED, activeSlot: null })
        .where(eq(aiTask.id, taskId)),
      ...(plan?.steps(q) || []),
    ]);
    return true;
  } catch (error) {
    if (error instanceof AtomicGuardError) return false;
    throw error;
  }
}

export async function expireTimedOutTasks(limit = 100, userId?: string) {
  const deadline = new Date(Date.now() - 20 * 60 * 1000);
  const tasks = await db()
    .select({ id: aiTask.id })
    .from(aiTask)
    .where(
      and(
        userId ? eq(aiTask.userId, userId) : undefined,
        inArray(aiTask.status, NON_TERMINAL_STATUSES),
        isNull(aiTask.deletedAt),
        lt(aiTask.createdAt, deadline)
      )
    )
    .limit(limit);

  let expiredCount = 0;
  for (const task of tasks) {
    if (await expireTaskIfNeeded(task.id)) expiredCount++;
  }
  return expiredCount;
}

/**
 * Create an AI task with optional credit consumption.
 */
export async function createTask(params: {
  userId: string;
  mediaType: string;
  provider: string;
  model: string;
  prompt: string;
  costCredits?: number;
  options?: any;
}): Promise<any> {
  const { userId, mediaType, provider, model, prompt, costCredits, options } =
    params;

  for (let attempt = 0; attempt < 3; attempt++) {
    const taskData: typeof aiTask.$inferInsert = {
      id: getUuid(),
      userId,
      mediaType,
      provider,
      model,
      prompt,
      status: AITaskStatus.PENDING,
      costCredits: costCredits || 0,
    };

    // Plan the credit charge first, then write the task and the charge in one
    // atomic step (D1-safe) — never a task without its charge or vice versa.
    const plan =
      costCredits && costCredits > 0
        ? await planConsume({
            userId,
            credits: costCredits,
            scene: 'ai_task',
            description: `AI ${mediaType} generation`,
            metadata: JSON.stringify({ taskId: taskData.id }),
          })
        : undefined;
    if (plan === null) throw new Error('Insufficient credits');
    if (plan) {
      // Stored for revocation if the task fails.
      taskData.taskInfo = JSON.stringify({
        creditId: plan.consumedCredit.id,
      });
    }

    try {
      await atomic((q) => [
        q.insert(aiTask).values(taskData),
        ...(plan ? plan.steps(q) : []),
      ]);
    } catch (error) {
      // A concurrent spend drained the grants we planned on: re-plan.
      if (error instanceof AtomicGuardError) continue;
      throw error;
    }

    const [task] = await db()
      .select()
      .from(aiTask)
      .where(eq(aiTask.id, taskData.id))
      .limit(1);
    return task;
  }
  throw new Error('Insufficient credits');
}

/**
 * Update task status. Revokes credits on failure.
 */
export async function updateTask(params: {
  taskId: string;
  status: AITaskStatus;
  taskResult?: any;
}) {
  const { taskId, status, taskResult } = params;

  const [task] = await db()
    .select()
    .from(aiTask)
    .where(eq(aiTask.id, taskId))
    .limit(1);

  if (!task) throw new Error('Task not found');

  // Update task
  const updateData: any = { status };
  if (
    status === AITaskStatus.SUCCESS ||
    status === AITaskStatus.FAILED ||
    status === AITaskStatus.CANCELED
  ) {
    updateData.activeSlot = null;
  }
  if (taskResult) {
    updateData.taskResult = JSON.stringify(taskResult);
  }

  // Terminal transitions and their refund must commit together on every backend.
  if (!NON_TERMINAL_STATUSES.includes(task.status as AITaskStatus)) return;
  const plan =
    status === AITaskStatus.FAILED || status === AITaskStatus.CANCELED
      ? await taskRevokePlan(task)
      : undefined;
  try {
    await atomic((q) => [
      guard({
        table: aiTask,
        column: 'userId',
        where: eq(aiTask.id, taskId),
        require: and(
          inArray(aiTask.status, NON_TERMINAL_STATUSES),
          isNull(aiTask.deletedAt)
        )!,
        message: 'Task already finished',
      }),
      q.update(aiTask).set(updateData).where(eq(aiTask.id, taskId)),
      ...(plan?.steps(q) || []),
    ]);
  } catch (error) {
    if (!(error instanceof AtomicGuardError)) throw error;
  }
}

/**
 * Get tasks for a user.
 */
export async function getTasks(params: {
  userId: string;
  mediaType?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { userId, mediaType, status, page = 1, limit = 20 } = params;

  return db()
    .select()
    .from(aiTask)
    .where(
      and(
        eq(aiTask.userId, userId),
        mediaType ? eq(aiTask.mediaType, mediaType) : undefined,
        status ? eq(aiTask.status, status) : undefined,
        isNull(aiTask.deletedAt)
      )
    )
    .orderBy(desc(aiTask.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);
}

/**
 * Find task by ID.
 */
export async function findTask(taskId: string) {
  const [result] = await db()
    .select()
    .from(aiTask)
    .where(eq(aiTask.id, taskId))
    .limit(1);
  return result;
}
