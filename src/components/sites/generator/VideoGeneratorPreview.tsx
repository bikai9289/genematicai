import React from 'react';
import { RotateCcw, Video } from 'lucide-react';

import { m } from '@/paraglide/messages.js';
import { DownloadButton } from '@/components/download-button';
import { Button, buttonVariants } from '@/components/ui/button';

export interface VideoGeneratorPreviewProps {
  title?: string;
  description?: string;
  isGenerating: boolean;
  progressText: string;
  generatedVideoUrl: string | null;
  videoLoadError: boolean;
  setVideoLoadError: (error: boolean) => void;
  setGeneratedVideoUrl: (url: string | null) => void;
}

export function VideoGeneratorPreview({
  title,
  description,
  isGenerating,
  progressText,
  generatedVideoUrl,
  videoLoadError,
  setVideoLoadError,
  setGeneratedVideoUrl,
}: VideoGeneratorPreviewProps) {
  return (
    <div className="bg-card border-border/80 relative flex min-h-[440px] flex-col justify-between overflow-hidden rounded-3xl border p-6 shadow-xl backdrop-blur-3xl sm:p-7 lg:min-h-[560px] dark:border-zinc-800/60 dark:bg-zinc-900/40">
      <div className="text-foreground relative z-10 mb-4 flex items-center font-sans text-xl font-semibold">
        <div className="bg-muted mr-3 rounded-xl p-2 shadow-inner">
          <Video className="text-muted-foreground h-5 w-5" />
        </div>
        <span>{title ?? m['app.generator.video_title']()}</span>
      </div>

      <div className="relative z-10 my-auto flex flex-1 flex-col items-center justify-center">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
            <div className="relative flex size-20 items-center justify-center sm:size-24">
              <div className="border-primary/20 absolute inset-0 animate-ping rounded-full border-2" />
              <div className="border-primary size-12 animate-spin rounded-full border-4 border-t-transparent sm:size-14" />
            </div>
            <div>
              <h3 className="text-foreground text-base font-bold sm:text-lg">
                {m['app.generator.generating']()}
              </h3>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                {progressText}
              </p>
            </div>
          </div>
        ) : generatedVideoUrl && !videoLoadError ? (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="relative max-h-[480px] w-full overflow-hidden rounded-2xl bg-black shadow-xl sm:max-h-[540px]">
              <video
                src={generatedVideoUrl}
                controls
                autoPlay
                loop
                playsInline
                onError={() => setVideoLoadError(true)}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex w-full flex-wrap items-center justify-between gap-2.5 pt-2">
              <DownloadButton
                url={generatedVideoUrl}
                filename="generated-video.mp4"
                className={buttonVariants({
                  variant: 'outline',
                  size: 'sm',
                  className: 'gap-1.5 text-xs',
                })}
                iconClassName="size-3.5"
              >
                <span>{m['app.generator.download_mp4']()}</span>
              </DownloadButton>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setGeneratedVideoUrl(null)}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="size-3.5" />
                <span>{m['app.generator.generate_video_btn']()}</span>
              </Button>
            </div>
          </div>
        ) : generatedVideoUrl && videoLoadError ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-destructive/10 flex size-16 items-center justify-center rounded-2xl shadow-inner">
              <Video className="text-destructive size-8 opacity-70" />
            </div>
            <h3 className="text-foreground mt-4 text-base font-bold sm:text-lg">
              {m['app.generator.preview_unavailable_title']()}
            </h3>
            <p className="text-muted-foreground mt-1.5 max-w-sm text-xs sm:text-sm">
              {m['app.generator.preview_unavailable_subtitle']()}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <DownloadButton
                url={generatedVideoUrl}
                filename="generated-video.mp4"
                className={buttonVariants({
                  variant: 'outline',
                  size: 'sm',
                  className: 'gap-1.5 text-xs',
                })}
                iconClassName="size-3.5"
              >
                <span>{m['app.generator.download_mp4']()}</span>
              </DownloadButton>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setGeneratedVideoUrl(null);
                  setVideoLoadError(false);
                }}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="size-3.5" />
                <span>{m['app.generator.generate_video_btn']()}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-primary/10 flex size-16 items-center justify-center rounded-md shadow-inner">
              <Video className="text-primary size-8 opacity-70" />
            </div>
            <h3 className="text-foreground mt-4 text-base font-bold sm:text-lg">
              {title ?? m['app.generator.video_title']()}
            </h3>
            <p className="text-muted-foreground mt-1.5 max-w-sm text-xs sm:text-sm">
              {description ?? m['app.generator.video_subtitle']()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
