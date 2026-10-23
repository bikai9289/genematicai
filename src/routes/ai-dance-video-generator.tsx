import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { VideoGeneratorWorkspace } from '@/components/sites/generator/VideoGeneratorWorkspace';

function danceFaq(locale: 'en' | 'zh') {
  const options = { locale };
  return [
    [
      m['genematic.dance.faq1_q']({}, options),
      m['genematic.dance.faq1_a']({}, options),
    ],
    [
      m['genematic.dance.faq2_q']({}, options),
      m['genematic.dance.faq2_a']({}, options),
    ],
    [
      m['genematic.dance.faq3_q']({}, options),
      m['genematic.dance.faq3_a']({}, options),
    ],
    [
      m['genematic.dance.faq4_q']({}, options),
      m['genematic.dance.faq4_a']({}, options),
    ],
    [
      m['genematic.dance.faq5_q']({}, options),
      m['genematic.dance.faq5_a']({}, options),
    ],
    [
      m['genematic.dance.faq6_q']({}, options),
      m['genematic.dance.faq6_a']({}, options),
    ],
  ];
}

export const Route = createFileRoute('/ai-dance-video-generator')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const title = m['genematic.dance.title']({}, { locale });
    const description = m['genematic.dance.description']({}, { locale });
    const url = localizeUrl(`${envConfigs.app_url}/ai-dance-video-generator`, {
      locale,
    }).href;
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
      links: [
        { rel: 'canonical', href: url },
        ...locales.map((locale) => ({
          rel: 'alternate',
          hrefLang: locale,
          href: localizeUrl(`${envConfigs.app_url}/ai-dance-video-generator`, {
            locale,
          }).href,
        })),
        {
          rel: 'alternate',
          hrefLang: 'x-default',
          href: `${envConfigs.app_url}/ai-dance-video-generator`,
        },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: danceFaq(locale).map(([name, text]) => ({
              '@type': 'Question',
              name,
              acceptedAnswer: { '@type': 'Answer', text },
            })),
          }),
        },
      ],
    };
  },
  component: DancePage,
});

function DancePage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16">
        <h1 className="mb-4 text-3xl font-semibold">
          {m['genematic.dance.heading']()}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          {m['genematic.dance.description']()}
        </p>
        <VideoGeneratorWorkspace
          previewTitle={m['genematic.dance.heading']()}
          previewDescription={m['genematic.dance.description']()}
          search={{
            prompt: m['genematic.dance.prompt'](),
            model: undefined,
            startImageUrl: undefined,
          }}
        />
        <section className="mt-16 border-t pt-12">
          <h2 className="mb-8 text-2xl font-semibold">
            {m['genematic.dance.how_title']()}
          </h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {[
              [
                m['genematic.dance.step1_title'](),
                m['genematic.dance.step1_body'](),
              ],
              [
                m['genematic.dance.step2_title'](),
                m['genematic.dance.step2_body'](),
              ],
              [
                m['genematic.dance.step3_title'](),
                m['genematic.dance.step3_body'](),
              ],
            ].map(([title, text], i) => (
              <li key={title}>
                <h3 className="mb-3 font-semibold">
                  {i + 1}. {title}
                </h3>
                <p className="text-muted-foreground leading-7">{text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="mt-16 border-t pt-12">
          <h2 className="mb-8 text-2xl font-semibold">
            {m['genematic.dance.faq_title']()}
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {danceFaq(getLocale()).map(([question, answer]) => (
              <div key={question}>
                <h3 className="mb-3 font-semibold">{question}</h3>
                <p className="text-muted-foreground leading-7">{answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
