export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  updatedAt: string;
  readTime: string;
  tag: string;
  image: string;
  content: Array<{
    heading?: string;
    paragraphs: string[];
    list?: string[];
  }>;
}

export const BLOG_POSTS: Record<string, BlogPost> = {
  '8-best-nano-banana-2-prompts': {
    slug: '8-best-nano-banana-2-prompts',
    title: '4 Nano Banana 2 Prompt Examples for Studio Art',
    description:
      'Four prompt ideas for exploring composition, lighting, style, and structure with Nano Banana 2.',
    updatedAt: '2026-10-18',
    readTime: '1 min read',
    tag: 'Prompt Guide',
    image: '/oss/display/home/image-to-image-ai-1.webp',
    content: [
      {
        heading: 'Mastering Nano Banana 2',
        paragraphs: [
          'Use these four starting points to explore product mockups, character art, and architectural scenes. Adjust the subject, lighting, and composition to suit your project.',
        ],
        list: [
          'Cyberpunk street photography with volumetric rain and neon signs',
          'Macro shot of mechanical hummingbird made of polished brass and gears',
          'Nordic minimalist kitchen interior bathed in warm morning sunlight',
          'Stylized 3D claymation character walking through miniature fantasy forest',
        ],
      },
      {
        heading: 'Prompt Engineering Best Practices',
        paragraphs: [
          'Always specify: Subject + Environment + Lighting conditions + Camera lens / Perspective + Art style keywords. Avoid negative prompt clutter and focus on descriptive visual cues.',
        ],
      },
    ],
  },
};

export const BLOG_POSTS_LIST = [BLOG_POSTS['8-best-nano-banana-2-prompts']];

const BLOG_POSTS_ZH: Record<string, BlogPost> = {
  '8-best-nano-banana-2-prompts': {
    slug: '8-best-nano-banana-2-prompts',
    title: '4 个 Nano Banana 2 创意提示词示例',
    description:
      '通过四个提示词示例，探索主体、构图、光线和视觉风格的描述方式。',
    updatedAt: '2026-10-18',
    readTime: '阅读约 1 分钟',
    tag: '提示词指南',
    image: '/oss/display/home/image-to-image-ai-1.webp',
    content: [
      {
        heading: '从四个场景开始',
        paragraphs: [
          '以下示例可作为产品概念图、角色设计和建筑场景的创作起点。请根据自己的项目调整主体、光线和构图。',
        ],
        list: [
          '赛博朋克街头摄影，雨幕中透出体积光，霓虹招牌映在湿润的路面上',
          '微距拍摄由抛光黄铜与齿轮组成的机械蜂鸟，突出金属质感和精密结构',
          '北欧极简厨房室内场景，温暖的晨光照亮台面和木质家具',
          '风格化的三维黏土动画角色，在微缩奇幻森林中漫步',
        ],
      },
      {
        heading: '如何调整提示词',
        paragraphs: [
          '可以按“主体、环境、光照、镜头或视角、艺术风格”的顺序组织描述。先明确希望画面呈现的具体细节，再逐步调整单个要素。',
        ],
      },
    ],
  },
};

export function getBlogPost(
  slug: string,
  locale: string
): BlogPost | undefined {
  return (locale === 'zh' ? BLOG_POSTS_ZH : BLOG_POSTS)[slug];
}

export function getBlogPosts(locale: string): BlogPost[] {
  return locale === 'zh' ? Object.values(BLOG_POSTS_ZH) : BLOG_POSTS_LIST;
}
