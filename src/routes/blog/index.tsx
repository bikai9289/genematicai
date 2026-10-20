import { createFileRoute, redirect } from '@tanstack/react-router';

import { localizeHref } from '@/paraglide/runtime.js';

export const Route = createFileRoute('/blog/')({
  beforeLoad: () => {
    throw redirect({ href: localizeHref('/posts'), statusCode: 301 });
  },
});
