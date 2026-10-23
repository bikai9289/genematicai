import { useEffect, useState } from 'react';

export type WallClip = { src: string; poster: string; alt?: string };

type Column = { clips: WallClip[]; dir: 'up' | 'down'; duration: string };

function useRichBackground() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 768px)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setEnabled(wide.matches && !calm.matches);
    sync();
    wide.addEventListener('change', sync);
    calm.addEventListener('change', sync);
    return () => {
      wide.removeEventListener('change', sync);
      calm.removeEventListener('change', sync);
    };
  }, []);

  return enabled;
}

function Tile({
  clip,
  live,
  priority,
}: {
  clip: WallClip;
  live: boolean;
  priority?: boolean;
}) {
  return (
    <div className="bg-muted/40 relative aspect-[9/16] w-full overflow-hidden rounded-xl ring-1 ring-white/5">
      {live ? (
        <video
          src={clip.src}
          poster={clip.poster}
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? 'auto' : 'metadata'}
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={clip.poster}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

export function VideoWall({ columns }: { columns: Column[] }) {
  const live = useRichBackground();

  return (
    <div
      aria-hidden="true"
      className="hero-darkroom hero-grain pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      <div className="absolute inset-0 hidden [mask-image:radial-gradient(ellipse_78%_70%_at_50%_45%,transparent_12%,#000_62%)] opacity-[0.34] [-webkit-mask-image:radial-gradient(ellipse_78%_70%_at_50%_45%,transparent_12%,#000_62%)] md:block">
        <div className="mx-auto grid h-full max-w-[1500px] grid-cols-3 gap-4 px-4 lg:grid-cols-4 lg:gap-5">
          {columns.map((col, i) => (
            <div
              key={i}
              style={{ ['--marquee-duration' as string]: col.duration }}
              className={[
                'flex flex-col gap-4 lg:gap-5',
                col.dir === 'up'
                  ? 'animate-marquee-up'
                  : 'animate-marquee-down',
                i === 3 ? 'hidden lg:flex' : '',
              ].join(' ')}
            >
              {[...col.clips, ...col.clips].map((clip, j) => (
                <Tile
                  key={`${i}-${j}`}
                  clip={clip}
                  live={live}
                  priority={i === 0 && j === 0}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background/55 absolute inset-0" />
      <div className="from-background via-background/35 to-background absolute inset-0 bg-gradient-to-b" />
      <div className="from-background absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t to-transparent" />
    </div>
  );
}
