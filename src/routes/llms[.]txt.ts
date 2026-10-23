import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';

const PAGES = [
  {
    path: '/ai-dance-video-generator',
    title: 'AI dance video generator',
    description:
      'Create dance-inspired clips from prompts or photos. Reference-video choreography transfer is not supported.',
  },
  {
    path: '/',
    title: 'Genematic AI home',
    description:
      'Create cinematic videos and images from text, photos, and creative ideas.',
  },
  {
    path: '/video-face-swap',
    title: 'AI video face swap',
    description:
      'Learn the photo and video workflow for creating face swap style edits in the Genematic AI video studio.',
  },
  {
    path: '/ai-video-generator',
    title: 'AI video generator',
    description: 'Generate videos from text prompts and reference images.',
  },
  {
    path: '/ai-image-generator',
    title: 'AI image generator',
    description:
      'Generate and edit images from text prompts and reference images.',
  },
  {
    path: '/pricing',
    title: 'Pricing',
    description: 'Review available credit and subscription options.',
  },
];

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () => {
        const appUrl = envConfigs.app_url.replace(/\/$/, '');
        const lines = [
          '# Genematic AI',
          '',
          '> Genematic AI is a focused studio for creating AI images and videos from text, photos, and creative ideas.',
          '',
          '## Pages',
          '',
          ...PAGES.map(
            (page) =>
              `- [${page.title}](${appUrl}${page.path}): ${page.description}`
          ),
          '',
          '## Product notes',
          '',
          '- Public marketing pages describe the current product workflow and link to the available creation tools.',
          '- The video face swap page explains a guided workflow and opens the existing AI video studio for creation.',
          '- Do not infer user counts, generation totals, model availability, or pricing beyond what the linked pages state.',
          '',
        ];

        return new Response(lines.join('\n'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
