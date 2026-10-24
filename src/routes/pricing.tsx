import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getPricingProduct } from '@/config/pricing';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Pricing } from '@/blocks/pricing';

export const Route = createFileRoute('/pricing')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['genematic.pricing.meta_title']({}, { locale }),
      description: m['landing.pricing.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => ({
    scripts: loaderData
      ? [
          {
            type: 'application/ld+json',
            children: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              '@id': `${envConfigs.app_url}/#application`,
              name: envConfigs.app_name,
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Web',
              isAccessibleForFree: false,
              offers: (() => {
                const packs = [
                  'genematic_starter_v2',
                  'genematic_creator_v2',
                  'genematic_studio_v2',
                ].map((id) => getPricingProduct(id)!);
                return {
                  '@type': 'AggregateOffer',
                  priceCurrency: 'USD',
                  lowPrice: Math.min(...packs.map((p) => p.priceInCents)) / 100,
                  highPrice:
                    Math.max(...packs.map((p) => p.priceInCents)) / 100,
                  offerCount: packs.length,
                  url: localizeUrl(`${envConfigs.app_url}/pricing`, {
                    locale: loaderData.locale,
                  }).href,
                  offers: packs.map((p) => ({
                    '@type': 'Offer',
                    name: p.productName,
                    price: p.priceInCents / 100,
                    priceCurrency: p.currency.toUpperCase(),
                  })),
                };
              })(),
            }).replace(/</g, '\\u003c'),
          },
        ]
      : [],
    links: loaderData
      ? [
          {
            rel: 'canonical',
            href: localizeUrl(`${envConfigs.app_url}/pricing`, {
              locale: loaderData.locale,
            }).href,
          },
          ...locales.map((locale) => ({
            rel: 'alternate',
            hrefLang: locale,
            href: localizeUrl(`${envConfigs.app_url}/pricing`, { locale }).href,
          })),
        ]
      : [],
    meta: loaderData
      ? [
          { title: loaderData.title },
          { name: 'description', content: loaderData.description },
          { property: 'og:type', content: 'website' },
          {
            property: 'og:url',
            content: localizeUrl(`${envConfigs.app_url}/pricing`, {
              locale: loaderData.locale,
            }).href,
          },
          { property: 'og:title', content: loaderData.title },
          { property: 'og:description', content: loaderData.description },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: loaderData.title },
          { name: 'twitter:description', content: loaderData.description },
        ]
      : [],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
