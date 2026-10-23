import { createFileRoute } from '@tanstack/react-router';

import { configurationManagementClosed } from '@/lib/configuration-management';

export const Route = createFileRoute('/api/admin/config/custom')({
  server: {
    handlers: {
      GET: configurationManagementClosed,
      POST: configurationManagementClosed,
    },
  },
});
