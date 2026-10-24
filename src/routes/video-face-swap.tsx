import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { VideoFaceSwapPage } from '@/components/sites/seo/VideoFaceSwapPage';

const faqNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const Route = createFileRoute('/video-face-swap')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const canonical = localizeUrl(`${envConfigs.app_url}/video-face-swap`, {
      locale,
    }).href;
    const questions = faqNumbers.map((n) => ({
      '@type': 'Question',
      name: m[`genematic.face_swap.faq${n}_q`]({}, { locale }),
      acceptedAnswer: {
        '@type': 'Answer',
        text: m[`genematic.face_swap.faq${n}_a`]({}, { locale }),
      },
    }));
    return {
      meta: [
        { title: m['genematic.face_swap.title']({}, { locale }) },
        {
          name: 'description',
          content: m['genematic.face_swap.meta_description']({}, { locale }),
        },
        {
          name: 'keywords',
          content:
            'video face swap, ai video face swap, free ai face swap, face swap video online free',
        },
        {
          property: 'og:title',
          content: m['genematic.face_swap.title']({}, { locale }),
        },
        {
          property: 'og:description',
          content: m['genematic.face_swap.meta_description']({}, { locale }),
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: canonical },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: m['genematic.face_swap.title']({}, { locale }),
        },
        {
          name: 'twitter:description',
          content: m['genematic.face_swap.meta_description']({}, { locale }),
        },
      ],
      links: [
        { rel: 'canonical', href: canonical },
        ...locales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: localizeUrl(`${envConfigs.app_url}/video-face-swap`, {
            locale: loc,
          }).href,
        })),
        {
          rel: 'alternate',
          hrefLang: 'x-default',
          href: localizeUrl(`${envConfigs.app_url}/video-face-swap`, {
            locale: 'en',
          }).href,
        },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'SoftwareApplication',
                name: m['genematic.face_swap.title']({}, { locale }),
                applicationCategory: 'MultimediaApplication',
                operatingSystem: 'Web',
                isAccessibleForFree: false,
              },
              { '@type': 'FAQPage', mainEntity: questions },
            ],
          }),
        },
      ],
    };
  },
  component: () => (
    <>
      <Header />
      <VideoFaceSwapPage />
      <Footer />
    </>
  ),
});
