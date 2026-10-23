import { createFileRoute } from '@tanstack/react-router';

import { m } from '@/paraglide/messages.js';

function EnvironmentSettingsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-xl font-semibold">
        {m['admin.settings.environment_title']()}
      </h1>
      <p className="text-muted-foreground mt-4 text-sm">
        {m['admin.settings.environment_description']()}
      </p>
    </main>
  );
}
export const Route = createFileRoute('/admin/settings')({
  component: EnvironmentSettingsPage,
});
