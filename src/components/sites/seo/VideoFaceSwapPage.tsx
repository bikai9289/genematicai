import {
  ArrowRight,
  Check,
  Images,
  Sparkles,
  Upload,
  Video,
} from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';

const faqs = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function VideoFaceSwapPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pt-28 pb-20 sm:px-6 lg:px-8">
          <div className="from-primary/15 pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b to-transparent" />
          <div className="mx-auto max-w-5xl text-center">
            <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
              <Sparkles className="size-3.5" />
              {m['genematic.face_swap.badge']()}
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
              {m['genematic.face_swap.title']()}
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-lg leading-8">
              {m['genematic.face_swap.subtitle']()}
            </p>
            <Link
              href="/ai-video-generator"
              className="bg-primary text-primary-foreground mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold shadow-lg transition-transform hover:scale-[1.02]"
            >
              {m['genematic.face_swap.cta']()}
              <ArrowRight className="size-4" />
            </Link>
            <p className="text-muted-foreground mt-3 text-sm">
              {m['genematic.face_swap.cta_note']()}
            </p>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              [Upload, 'genematic.face_swap.card_upload'],
              [Images, 'genematic.face_swap.card_photo'],
              [Video, 'genematic.face_swap.card_result'],
            ].map(([Icon, key]) => (
              <div
                key={key}
                className="border-border bg-card rounded-2xl border p-6"
              >
                <Icon className="text-primary mb-4 size-6" />
                <h2 className="font-semibold">
                  {m[`${key}.title` as keyof typeof m]()}
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {m[`${key}.description` as keyof typeof m]()}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold tracking-tight">
              {m['genematic.face_swap.how_title']()}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex gap-4">
                  <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    {step}
                  </span>
                  <div>
                    <h3 className="font-semibold">
                      {m[
                        `genematic.face_swap.step${step}_title` as keyof typeof m
                      ]()}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-6">
                      {m[
                        `genematic.face_swap.step${step}_description` as keyof typeof m
                      ]()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold tracking-tight">
              {m['genematic.face_swap.free_title']()}
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Check className="text-primary mt-0.5 size-5 shrink-0" />
                  <span className="text-muted-foreground">
                    {m[`genematic.face_swap.free${item}` as keyof typeof m]()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
              <Link
                href="/ai-image-generator"
                className="text-primary inline-flex items-center gap-1 hover:underline"
              >
                {m['genematic.face_swap.photo_tool_link']()}{' '}
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/pricing"
                className="text-primary inline-flex items-center gap-1 hover:underline"
              >
                {m['genematic.face_swap.pricing_link']()}{' '}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold tracking-tight">
              {m['genematic.face_swap.faq_title']()}
            </h2>
            <div className="divide-border mt-8 divide-y rounded-2xl border px-6">
              {faqs.map((n) => (
                <details key={n} className="py-5">
                  <summary className="cursor-pointer font-semibold">
                    {m[`genematic.face_swap.faq${n}_q` as keyof typeof m]()}
                  </summary>
                  <p className="text-muted-foreground mt-3 max-w-3xl leading-7">
                    {m[`genematic.face_swap.faq${n}_a` as keyof typeof m]()}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            {m['genematic.face_swap.final_title']()}
          </h2>
          <Link
            href="/ai-video-generator"
            className="bg-primary text-primary-foreground mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold"
          >
            {m['genematic.face_swap.cta']()} <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
