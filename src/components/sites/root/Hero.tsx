'use client';

import { ArrowRight, Play, Sparkles } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { VideoWall, type WallClip } from '@/components/sites/root/video-wall';
import { buttonVariants } from '@/components/ui/button';

const clip = (src: string, poster: string): WallClip => ({ src, poster });

const product = clip(
  '/oss/display/home/text-to-video-ai.mp4',
  '/oss/display/home/text-to-video-ai-cover.webp'
);
const stillA = clip(
  '/oss/display/home/text-to-video-ai.mp4',
  '/imgs/blocks/block-video.jpg'
);
const stillB = clip(
  '/oss/display/home/text-to-video-ai.mp4',
  '/imgs/blocks/block-img.jpg'
);
const stillC = clip(
  '/oss/display/home/text-to-video-ai.mp4',
  '/oss/display/home/image-to-image-ai-2.webp'
);

const COLUMNS = [
  {
    dir: 'up' as const,
    duration: '54s',
    clips: [product, stillA, stillB, stillC],
  },
  {
    dir: 'down' as const,
    duration: '68s',
    clips: [stillA, product, stillC, stillB],
  },
  {
    dir: 'up' as const,
    duration: '60s',
    clips: [stillB, stillC, product, stillA],
  },
  {
    dir: 'down' as const,
    duration: '74s',
    clips: [stillC, stillB, stillA, product],
  },
];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[88vh] items-center justify-center overflow-hidden pt-24 pb-20"
    >
      <VideoWall columns={COLUMNS} />

      <div className="relative z-10 container mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="border-border/70 bg-card/60 mb-7 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 backdrop-blur-md">
          <Sparkles className="text-primary size-3.5" aria-hidden="true" />
          <span className="text-foreground/90 text-xs font-semibold tracking-wide">
            Genematic AI
          </span>
          <span className="bg-border h-3 w-px" />
          <span className="text-muted-foreground text-xs font-medium">
            {m['genematic.home.eyebrow_product']()}
          </span>
        </div>

        <h1 className="text-foreground mx-auto mb-6 max-w-3xl text-[2.6rem] leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-6xl lg:text-[4.25rem]">
          {m['genematic.home.hero_title_line1']()}
          <br className="hidden sm:block" />{' '}
          <span className="text-primary italic">
            {m['genematic.home.hero_title_motion']()}
          </span>
        </h1>

        <p className="text-muted-foreground mx-auto mb-10 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
          {m['genematic.home.hero_description']()}
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/ai-video-generator"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'group shadow-primary/25 h-12 w-full px-7 text-[0.95rem] font-semibold shadow-lg sm:w-auto'
            )}
          >
            {m['genematic.home.photo_cta']()}
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/ai-video-generator"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'lg' }),
              'text-foreground/80 hover:text-foreground h-12 w-full px-6 text-[0.95rem] font-medium sm:w-auto'
            )}
          >
            <Play className="size-4" />
            {m['genematic.home.watch_cta']()}
          </Link>
        </div>

        <dl className="mx-auto mt-12 flex max-w-lg flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
          {(
            [
              [
                m['genematic.home.stat_render_value'](),
                m['genematic.home.stat_render_label'](),
              ],
              [
                m['genematic.home.stat_res_value'](),
                m['genematic.home.stat_res_label'](),
              ],
              [
                m['genematic.home.stat_aspect_value'](),
                m['genematic.home.stat_aspect_label'](),
              ],
            ] as const
          ).map(([value, label]) => (
            <div key={label} className="flex items-baseline gap-2">
              <dt className="text-foreground font-semibold">{value}</dt>
              <dd className="text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
