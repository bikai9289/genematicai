import { createFileRoute } from '@tanstack/react-router';

import { configurationManagementClosed } from '@/lib/configuration-management';

export const Route = createFileRoute('/api/admin/settings/test')({
  server: {
    handlers: {
      POST: configurationManagementClosed,
    },
  },
});
