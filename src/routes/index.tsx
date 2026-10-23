'use client';

import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Pricing } from '@/blocks/pricing';
import { SupportWidget } from '@/blocks/support-widget';
import { CoreFeatures } from '@/components/sites/root/CoreFeatures';
import { FaqCta } from '@/components/sites/root/FaqCta';
import { Hero } from '@/components/sites/root/Hero';
import { IntroduceBenefits } from '@/components/sites/root/IntroduceBenefits';
import { Logos } from '@/components/sites/root/Logos';
import { StatsTestimonials } from '@/components/sites/root/StatsTestimonials';
import { UsageSteps } from '@/components/sites/root/UsageSteps';
import { ShowcasesFlowDynamic } from '@/components/sites/showcase/ShowcasesFlowDynamic';

/**
 * Genematic AI Landing Page migrated from cloudflare branch.
 * Complete with Hero, Showcases Flow, Logos, Image-to-Video Showcase,
 * Features, Benefits, Workflow, Community Proof, Pricing, FAQ & CTA.
 */
function HomePage() {
  return (
    <div className="bg-background text-foreground selection:bg-primary/20 selection:text-primary flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* 1. Cinematic Cloudflare-Style Hero */}
        <Hero />

        {/* 2. Trending AI Showcases Flow */}
        <ShowcasesFlowDynamic
          hideWhenEmpty
          title={m['app.generator.trending_title']()}
          description={m['app.generator.trending_subtitle']()}
        />

        {/* 3. AI Model Engine Logos */}
        <Logos />

        {/* 4. Interactive Image to Video Comparison Showcase */}

        {/* 5. Core Platform Features */}
        <CoreFeatures />

        {/* 6. Introduce & Benefits */}
        <IntroduceBenefits />

        {/* 7. Three Simple Steps Workflow */}
        <UsageSteps />

        {/* 8. Stats & Global Creator Testimonials */}
        <StatsTestimonials />

        {/* 9. Transparent Pricing Plans */}
        <Pricing heading="h2" />

        {/* 10. FAQ & Conversion CTA */}
        <FaqCta />
      </main>
      <Footer />
      <SupportWidget />
    </div>
  );
}

export const Route = createFileRoute('/')({
  loader: async () => {
    const locale = getLocale();
    return { locale };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}/`, { locale: loc as any }).href;
    return {
      meta: [
        {
          title: m['genematic.home.title']({}, { locale: locale as any }),
        },
        {
          name: 'description',
          content: m['genematic.home.meta_description'](
            {},
            { locale: locale as any }
          ),
        },
        {
          name: 'keywords',
          content:
            'photo to video ai, ai video generator from photo, cinematic ai video, free ai video generator',
        },
        {
          property: 'og:title',
          content: m['genematic.home.title']({}, { locale: locale as any }),
        },
        {
          property: 'og:description',
          content: m['genematic.home.meta_description'](
            {},
            { locale: locale as any }
          ),
        },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: m['genematic.home.title']({}, { locale: locale as any }),
        },
        {
          name: 'twitter:description',
          content: m['genematic.home.meta_description'](
            {},
            { locale: locale as any }
          ),
        },
      ],
      links: [
        {
          rel: 'preload',
          as: 'image',
          href: '/oss/display/home/text-to-video-ai-cover.webp',
        },
        { rel: 'canonical', href: urlFor(locale) },
        ...locales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: urlFor(loc),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: urlFor('en') },
      ],
    };
  },
  component: HomePage,
});
