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
  '4-nano-banana-2-prompts': {
    slug: '4-nano-banana-2-prompts',
    title: '4 Nano Banana 2 Prompt Examples for Studio Art',
    description:
      'Four prompt ideas for exploring composition, lighting, style, and structure with Nano Banana 2.',
    updatedAt: '2026-10-24',
    readTime: '3 min read',
    tag: 'Prompt Guide',
    image: '/oss/display/home/image-to-image-ai-1.webp',
    content: [
      {
        heading: 'Mastering Nano Banana 2',
        paragraphs: [
          'Use these four starting points to explore product mockups, character art, and architectural scenes. Adjust the subject, lighting, and composition to suit your project.',
        ],
        list: [
          'Rainy city street at night, a single cyclist in the lower-left third, neon reflections on wet asphalt, low street-level viewpoint, documentary photography, muted blue shadows and warm shop windows. Leave the upper-right area uncluttered for a headline.',
          'Macro product photograph of a mechanical hummingbird built from polished brass and exposed gears, perched on a dark stone base, side lighting to reveal the metal texture, shallow depth of field, plain charcoal background, the full beak and both wings inside the frame.',
          'Nordic minimalist kitchen with pale oak cabinets and a white stone island, warm morning light entering from a window on the left, eye-level wide composition, straight vertical lines, a single ceramic bowl on the counter, realistic architectural photography.',
          'A small clay forest explorer with a green coat and round backpack, standing on a mossy path in a miniature fantasy forest, handmade clay texture, soft overhead light, full-body three-quarter view, a clear silhouette against the background, square composition.',
        ],
      },
      {
        heading: 'Prompt Engineering Best Practices',
        paragraphs: [
          'Start with subject, environment, lighting, viewpoint, and visual style. These examples are writing templates, not a tested benchmark or a guarantee of a particular model output. Camera terms describe a desired appearance; they do not configure a physical camera.',
          'For the street scene, inspect whether the cyclist remains the main subject and whether the headline area is clear. For the hummingbird, check cropped wings and implausible gear shapes. For the kitchen, inspect cabinet geometry and vertical lines. For the clay character, check the silhouette, hands, and backpack attachment.',
          'Change one instruction at a time: first simplify the subject, then adjust composition, then lighting. Save the prompt and selected settings alongside each result so you can compare attempts. Repeating the same prompt can still produce different images; extra attempts consume additional credits.',
          'Choose Nano Banana 2 in the image workspace if that is the model you intend to use, then check the displayed resolution and credit estimate before generating. Use reference images only when you have the required rights. Review faces, text, logos, and small details before publishing; generating an image does not establish legal clearance for its contents.',
        ],
      },
    ],
  },
};

export const BLOG_POSTS_LIST = [BLOG_POSTS['4-nano-banana-2-prompts']];

const BLOG_POSTS_ZH: Record<string, BlogPost> = {
  '4-nano-banana-2-prompts': {
    slug: '4-nano-banana-2-prompts',
    title: '4 个 Nano Banana 2 创意提示词示例',
    description:
      '通过四个提示词示例，探索主体、构图、光线和视觉风格的描述方式。',
    updatedAt: '2026-10-24',
    readTime: '阅读约 3 分钟',
    tag: '提示词指南',
    image: '/oss/display/home/image-to-image-ai-1.webp',
    content: [
      {
        heading: '从四个场景开始',
        paragraphs: [
          '以下示例可作为产品概念图、角色设计和建筑场景的创作起点。请根据自己的项目调整主体、光线和构图。',
        ],
        list: [
          '雨夜城市街道，一位骑行者位于画面左下三分之一处，霓虹映在湿润路面上，低机位纪实摄影，蓝色暗部与温暖橱窗形成对比，右上方留出干净的标题空间。',
          '机械蜂鸟产品微距照片，抛光黄铜与外露齿轮组成身体，停在深色石座上，侧光突出金属纹理，浅景深，纯炭灰背景，完整鸟喙和双翼都位于画面内。',
          '北欧极简厨房，浅橡木橱柜与白色石材中岛，晨光从左侧窗户照入，平视广角构图，竖直线条保持笔直，台面仅放一个陶碗，建筑摄影风格。',
          '微缩奇幻森林中的黏土探险者，身穿绿外套、背圆形背包，站在苔藓小径上，保留手工黏土纹理，柔和顶光，全身四分之三侧面视角，轮廓与背景分离，方形构图。',
        ],
      },
      {
        heading: '如何调整提示词',
        paragraphs: [
          '可以按“主体、环境、光照、镜头或视角、艺术风格”的顺序组织描述。先明确希望画面呈现的具体细节，再逐步调整单个要素。',
          '这些示例是写作模板，不是实测榜单，也不保证模型输出。镜头术语描述希望获得的画面观感，并不代表操作真实相机参数。',
          '街景先检查主体和标题留白；蜂鸟检查翅膀是否被裁切、齿轮结构是否合理；厨房检查橱柜几何和竖直线；黏土角色检查手部、轮廓和背包连接。',
          '每次只修改一项：先简化主体，再调整构图，最后调整光照。保存提示词和设置以便比较；相同提示词也可能产生不同图片，多次尝试会额外消耗积分。',
          '如果准备使用 Nano Banana 2，请先在图片工作区选择对应模型，再核对分辨率和积分估算。参考图片须具备使用授权。发布前检查人脸、文字、标志和细节；生成结果本身不代表已取得内容相关权利。',
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
