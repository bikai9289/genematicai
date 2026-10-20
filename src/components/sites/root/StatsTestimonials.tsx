'use client';

import React from 'react';
import { Image as ImageIcon, Video, Wand2 } from 'lucide-react';

import { m } from '@/paraglide/messages.js';

export function StatsTestimonials() {
  const capabilities = [
    {
      icon: Video,
      label: m['landing.testimonials.stat1_label'](),
      desc: m['landing.testimonials.stat1_desc'](),
    },
    {
      icon: ImageIcon,
      label: m['landing.testimonials.stat2_label'](),
      desc: m['landing.testimonials.stat2_desc'](),
    },
    {
      icon: Wand2,
      label: m['landing.testimonials.stat3_label'](),
      desc: m['landing.testimonials.stat3_desc'](),
    },
  ];

  return (
    <section className="border-border/60 bg-background relative border-t py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h2 className="text-foreground font-serif text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {m['landing.testimonials.main_title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
            {m['landing.testimonials.main_desc']()}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="bg-card border-border/80 hover:border-primary/40 rounded-2xl border p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="bg-primary/10 text-primary mb-5 flex size-11 items-center justify-center rounded-xl">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-foreground text-lg font-bold">
                  {item.label}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
