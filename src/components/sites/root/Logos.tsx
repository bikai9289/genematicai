'use client';

import React from 'react';

import { m } from '@/paraglide/messages.js';

const LOGO_ITEMS = [
  {
    name: 'Nano Banana 2',
    src: '/oss/model/icon/nano-banana-80.webp',
  },
  {
    name: 'Wan 3.0',
    src: '/oss/model/icon/wan-80.webp',
  },
];

export function Logos() {
  return (
    <section className="border-border/60 bg-background/50 border-y py-10 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <p className="text-muted-foreground mb-6 text-center text-xs font-semibold tracking-wider uppercase sm:mb-8 sm:text-sm">
          {m['landing.logos.title']()}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 md:gap-4">
          {LOGO_ITEMS.map((item, index) => (
            <div
              key={index}
              className="border-border/70 bg-card/90 flex items-center gap-2 rounded-full border px-3.5 py-1.5 shadow-xs transition-transform duration-200 hover:scale-105 sm:px-4 sm:py-2"
            >
              <img
                src={item.src}
                alt={item.name}
                loading="lazy"
                decoding="async"
                className="size-5 shrink-0 rounded-full object-cover sm:size-5.5"
              />
              <span className="text-foreground text-xs font-semibold whitespace-nowrap sm:text-sm">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
