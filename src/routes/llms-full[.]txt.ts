import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';

const PAGES = [
  [
    'AI dance video generator',
    '/ai-dance-video-generator',
    'Create dance-inspired clips from prompts or photos; reference-video choreography transfer is not supported.',
  ],
  [
    'Genematic AI home',
    '/',
    'Create cinematic videos and images from text, photos, and creative ideas.',
  ],
  [
    'AI video face swap',
    '/video-face-swap',
    'A guided photo and video workflow for face swap style edits.',
  ],
  [
    'AI video generator',
    '/ai-video-generator',
    'Generate videos from text prompts and reference images.',
  ],
  [
    'AI image generator',
    '/ai-image-generator',
    'Generate and edit images from text prompts and reference images.',
  ],
  ['Pricing', '/pricing', 'Review available credit and subscription options.'],
] as const;

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: async () => {
        const appUrl = envConfigs.app_url.replace(/\/$/, '');
        const lines = [
          '# Genematic AI',
          '',
          '> Genematic AI is a focused studio for creating AI images and videos from text, photos, and creative ideas.',
          '',
          '## Public pages',
          '',
          ...PAGES.flatMap(([title, path, description]) => [
            `### ${title}`,
            `URL: ${appUrl}${path}`,
            `Description: ${description}`,
            '',
          ]),
          '## Accuracy note',
          '',
          'Use the linked pages as the source of truth for current workflows, availability, and pricing. Do not infer social proof or model guarantees.',
          '',
        ];

        return new Response(lines.join('\n'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
