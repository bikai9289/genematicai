import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ResendProvider } from './resend';

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));

describe('Resend reply routing', () => {
  beforeEach(() =>
    send
      .mockReset()
      .mockResolvedValue({ data: { id: 'test-email' }, error: null })
  );
  const message = {
    to: 'recipient@example.com',
    subject: 'Test',
    text: 'Message',
  };
  const provider = () =>
    new ResendProvider({
      apiKey: 'test',
      defaultFrom: 'noreply@example.com',
      defaultReplyTo: 'support@example.com',
    });
  it('sends the configured support reply address with the provider request', async () => {
    expect((await provider().sendEmail(message)).success).toBe(true);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@example.com',
        replyTo: 'support@example.com',
        to: ['recipient@example.com'],
      })
    );
  });
  it('preserves an explicit per-message reply address', async () => {
    await provider().sendEmail({ ...message, replyTo: 'other@example.com' });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ replyTo: 'other@example.com' })
    );
  });
  it('reports provider rejection instead of claiming success', async () => {
    send.mockResolvedValueOnce({ data: null, error: { message: 'Rejected' } });
    expect(await provider().sendEmail(message)).toMatchObject({
      success: false,
      error: 'Rejected',
    });
  });
});
