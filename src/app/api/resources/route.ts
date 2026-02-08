import { NextRequest, NextResponse } from 'next/server';
import { Prisma, Resource } from '@prisma/client';
import { db } from '@/lib/supabase-db';

type ResourceListItem = Pick<
  Resource,
  | 'id'
  | 'name'
  | 'description'
  | 'url'
  | 'category'
  | 'price'
  | 'is_open_source'
  | 'global_sticky_order'
  | 'category_sticky_order'
  | 'published_at'
>;

const MOCK_RESOURCES = [
  {
    id: 'mock-1',
    name: 'GPT-4',
    description: 'OpenAI 开发的大型语言模型，具有强大的理解和生成能力，支持多种任务如对话、写作、编程辅助等。',
    url: 'https://openai.com/gpt-4',
    category: 'foundation-models',
    price: 'Freemium',
    is_open_source: false,
    global_sticky_order: 1,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    name: 'GitHub Copilot',
    description: 'AI 编程助手，能够根据上下文自动补全代码，支持多种编程语言和 IDE。',
    url: 'https://github.com/features/copilot',
    category: 'coding',
    price: 'Freemium',
    is_open_source: false,
    global_sticky_order: 0,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    name: 'Midjourney',
    description: 'AI 图像生成工具，通过文本描述创建高质量的艺术图像。',
    url: 'https://midjourney.com',
    category: 'image',
    price: 'Freemium',
    is_open_source: false,
    global_sticky_order: 0,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-4',
    name: 'Claude',
    description: 'Anthropic 开发的 AI 助手，擅长长文本理解、写作和对话。',
    url: 'https://claude.ai',
    category: 'foundation-models',
    price: 'Freemium',
    is_open_source: false,
    global_sticky_order: 0,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-5',
    name: 'Notion AI',
    description: '集成在 Notion 中的 AI 助手，帮助写作、总结和头脑风暴。',
    url: 'https://notion.so',
    category: 'knowledge',
    price: 'Freemium',
    is_open_source: false,
    global_sticky_order: 0,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-6',
    name: 'ChatGPT',
    description: 'OpenAI 开发的对话式 AI，能够进行自然语言对话并协助完成各种任务。',
    url: 'https://chat.openai.com',
    category: 'foundation-models',
    price: 'Freemium',
    is_open_source: false,
    global_sticky_order: 0,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-7',
    name: 'Stable Diffusion',
    description: '开源的 AI 图像生成模型，可以在本地运行生成高质量图像。',
    url: 'https://stability.ai',
    category: 'image',
    price: 'Free',
    is_open_source: true,
    global_sticky_order: 0,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-8',
    name: 'Jasper',
    description: 'AI 写作助手，专注于营销文案、博客文章和社交媒体内容创作。',
    url: 'https://jasper.ai',
    category: 'writing',
    price: 'Paid',
    is_open_source: false,
    global_sticky_order: 0,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-9',
    name: 'DeepL',
    description: 'AI 驱动的翻译工具，提供高质量的机器翻译服务。',
    url: 'https://deepl.com',
    category: 'writing',
    price: 'Freemium',
    is_open_source: false,
    global_sticky_order: 0,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-10',
    name: 'Gamma',
    description: 'AI 演示文稿生成工具，通过文本描述快速创建精美的 PPT。',
    url: 'https://gamma.app',
    category: 'office',
    price: 'Freemium',
    is_open_source: false,
    global_sticky_order: 0,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-11',
    name: 'Elicit',
    description: 'AI 科研助手，帮助研究人员快速找到相关论文和提取关键信息。',
    url: 'https://elicit.org',
    category: 'research',
    price: 'Freemium',
    is_open_source: false,
    global_sticky_order: 0,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-12',
    name: 'Character.AI',
    description: 'AI 角色扮演平台，可以与各种虚拟角色进行对话。',
    url: 'https://character.ai',
    category: 'entertainment',
    price: 'Freemium',
    is_open_source: false,
    global_sticky_order: 0,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '0');
  const offset = parseInt(searchParams.get('offset') || '0');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'default';

  try {
    // Define DB operation logic
    const dbQuery = async () => {
      // Build where clause
      const where: Prisma.ResourceWhereInput = {
        status: 'published',
      };

      if (category && category !== 'all') {
        where.category = category;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Build order by
      let orderBy: Prisma.ResourceOrderByWithRelationInput | Prisma.ResourceOrderByWithRelationInput[] = [
        { global_sticky_order: 'desc' },
        { category_sticky_order: 'desc' }
      ];
      
      switch (sort) {
        case 'newest':
          (orderBy as Prisma.ResourceOrderByWithRelationInput[]).push({ published_at: 'desc' });
          break;
        case 'alphabetical':
          (orderBy as Prisma.ResourceOrderByWithRelationInput[]).push({ name: 'asc' });
          break;
        case 'random':
          // Random handled separately
          break;
        default:
          (orderBy as Prisma.ResourceOrderByWithRelationInput[]).push({ published_at: 'desc' });
      }

      // Calculate total count
      const total = await db.resource.count({ where });

      let resources: ResourceListItem[];

      if (sort === 'random') {
         const randomTake = limit > 0 ? limit : undefined;
         const rawResources = (await db.resource.findMany({
            where,
            select: {
              id: true, name: true, description: true, url: true, category: true, 
              price: true, is_open_source: true, global_sticky_order: true, 
              category_sticky_order: true, published_at: true,
            },
            take: randomTake ? 100 : undefined,
         })) as ResourceListItem[];
         
         const stickyItems = rawResources.filter(r => r.global_sticky_order > 0 || r.category_sticky_order > 0);
         const nonStickyItems = rawResources.filter(r => r.global_sticky_order === 0 && r.category_sticky_order === 0);
         
         stickyItems.sort((a, b) => {
            if (a.global_sticky_order !== b.global_sticky_order) return b.global_sticky_order - a.global_sticky_order;
            return b.category_sticky_order - a.category_sticky_order;
         });
         
         const shuffled = [...nonStickyItems].sort(() => Math.random() - 0.5);
         resources = [...stickyItems, ...shuffled];
         
         if (limit > 0) {
           resources = resources.slice(0, limit);
         }
      } else {
        resources = (await db.resource.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit > 0 ? limit : undefined,
          select: {
            id: true, name: true, description: true, url: true, category: true,
            price: true, is_open_source: true, global_sticky_order: true,
            category_sticky_order: true, published_at: true,
          },
        })) as ResourceListItem[];
      }
      return { resources, total };
    };

    // Race DB query against 10s timeout
    const timeoutPromise = new Promise<{resources: ResourceListItem[], total: number}>((_, reject) =>
      setTimeout(() => reject(new Error('DB_TIMEOUT')), 10000)
    );

    const { resources, total } = await Promise.race([
      dbQuery(),
      timeoutPromise
    ]);

    return NextResponse.json({
      resources,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    
    // Return mock data when DB connection fails (e.g. no internet/DNS or timeout)
    let mockResources = [...MOCK_RESOURCES];

    // Apply filters to mock data
    if (category && category !== 'all') {
      mockResources = mockResources.filter(r => r.category === category);
    }
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      mockResources = mockResources.filter(r => 
        r.name.toLowerCase().includes(lowerSearch) || 
        (r.description && r.description.toLowerCase().includes(lowerSearch))
      );
    }
    
    const total = mockResources.length;

    if (limit > 0) {
      mockResources = mockResources.slice(offset, offset + limit);
    }
    
    return NextResponse.json({
      resources: mockResources,
      total,
      limit,
      offset,
      warning: 'Using mock data due to database connection error'
    });
  }
}
