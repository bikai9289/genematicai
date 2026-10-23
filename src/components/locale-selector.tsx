import { useLocation } from '@tanstack/react-router';
import { Check, ChevronDown, Globe, Languages } from 'lucide-react';

import { localeNames } from '@/config/locale';
import { cn } from '@/lib/utils';
import {
  getLocale,
  locales,
  localizeHref,
  setLocale,
} from '@/paraglide/runtime.js';

export function LocaleSelector({
  variant = 'icon',
  className,
}: {
  variant?: 'icon' | 'pill';
  className?: string;
}) {
  const locale = getLocale();
  const location = useLocation();
  const href =
    location.pathname +
    location.searchStr +
    (location.hash ? `#${location.hash}` : '');
  return (
    <details className="group relative">
      <summary
        aria-label="Switch language"
        title="Switch language"
        className={cn(
          'inline-flex cursor-pointer list-none items-center outline-none [&::-webkit-details-marker]:hidden',
          variant === 'icon'
            ? 'text-muted-foreground hover:bg-accent size-9 justify-center rounded-md'
            : 'h-10 gap-2 rounded-md border px-4 text-sm',
          className
        )}
      >
        {variant === 'icon' ? (
          <Languages className="size-4" />
        ) : (
          <>
            <Globe className="size-4" />
            <span>{localeNames[locale] || locale}</span>
            <ChevronDown className="size-4" />
          </>
        )}
      </summary>
      <nav
        aria-label="Languages"
        className="bg-popover text-popover-foreground border-border absolute right-0 z-50 mt-2 min-w-32 rounded-md border p-1 shadow-md"
      >
        {locales.map((loc) => (
          <a
            key={loc}
            href={localizeHref(href, { locale: loc })}
            hrefLang={loc}
            lang={loc}
            aria-current={locale === loc ? 'true' : undefined}
            onClick={() => setLocale(loc, { reload: false })}
            className="hover:bg-accent flex min-h-10 items-center justify-between gap-4 rounded px-3 py-2 text-sm"
          >
            {localeNames[loc] || loc}
            {loc === locale && <Check className="size-3.5" />}
          </a>
        ))}
      </nav>
    </details>
  );
}
