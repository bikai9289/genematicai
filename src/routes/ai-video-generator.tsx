import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { getLocale, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { VideoGeneratorWorkspace } from '@/components/sites/generator/VideoGeneratorWorkspace';
import { ShowcasesFlowDynamic } from '@/components/sites/showcase/ShowcasesFlowDynamic';

function AIVideoGeneratorPage() {
  const search = Route.useSearch();

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-4 pt-20 pb-16 sm:px-6 md:pt-24 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header Banner */}
          <div className="mb-6 text-center md:mb-10 md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
              <Sparkles className="size-3.5" />
              <span>Genematic AI Cinema</span>
            </div>
            <h1 className="text-foreground mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-5xl">
              {m['app.generator.video_title']()}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base md:text-lg">
              {m['app.generator.video_subtitle']()}
            </p>
          </div>

          {/* Generator Workspace */}
          <VideoGeneratorWorkspace search={search} />

          {/* Inspiration Gallery Section */}
          <div className="border-border/60 mt-14 border-t pt-12 sm:mt-20 sm:pt-16">
            <div className="mb-6 text-center sm:mb-8">
              <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
                {m['app.generator.showcases_title']()}
              </h2>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                {m['app.generator.showcases_subtitle']()}
              </p>
            </div>
            <ShowcasesFlowDynamic type="video" hideCreateButton={false} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export const Route = createFileRoute('/ai-video-generator')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const title = `${m['app.generator.video_title']({}, { locale })} | Genematic AI`;
    const description = m['app.generator.video_subtitle']({}, { locale });
    const canonical = localizeUrl(`${envConfigs.app_url}/ai-video-generator`, {
      locale,
    }).href;
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: canonical },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
      links: [{ rel: 'canonical', href: canonical }],
    };
  },
  validateSearch: (search: Record<string, unknown>) => {
    return {
      prompt: typeof search.prompt === 'string' ? search.prompt : undefined,
      model: typeof search.model === 'string' ? search.model : undefined,
      startImageUrl:
        typeof search.startImageUrl === 'string'
          ? search.startImageUrl
          : undefined,
    };
  },
  component: AIVideoGeneratorPage,
});
