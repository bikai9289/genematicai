import { configurationManagementClosed } from '@/lib/configuration-management';

export async function POST() {
  return configurationManagementClosed();
}
