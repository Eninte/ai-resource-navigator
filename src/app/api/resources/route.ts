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
    name: 'Next.js',
    description: 'The React Framework for the Web. Used by some of the world\'s largest companies, Next.js enables you to create full-stack Web applications by extending the latest React features.',
    url: 'https://nextjs.org',
    category: 'development',
    price: 'Free',
    is_open_source: true,
    global_sticky_order: 1,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    name: 'Tailwind CSS',
    description: 'A utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup.',
    url: 'https://tailwindcss.com',
    category: 'design',
    price: 'Free',
    is_open_source: true,
    global_sticky_order: 0,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    name: 'Vercel',
    description: 'Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.',
    url: 'https://vercel.com',
    category: 'infrastructure',
    price: 'Freemium',
    is_open_source: false,
    global_sticky_order: 0,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  },
   {
    id: 'mock-4',
    name: 'Supabase',
    description: 'Supabase is an open source Firebase alternative. Start your project with a Postgres database, Authentication, instant APIs, Edge Functions, Realtime subscriptions, Storage, and Vector embeddings.',
    url: 'https://supabase.com',
    category: 'database',
    price: 'Freemium',
    is_open_source: true,
    global_sticky_order: 0,
    category_sticky_order: 0,
    published_at: new Date().toISOString(),
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'default';

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
    let orderBy: Prisma.ResourceOrderByWithRelationInput | Prisma.ResourceOrderByWithRelationInput[] = {};
    
    switch (sort) {
      case 'newest':
        orderBy = { published_at: 'desc' };
        break;
      case 'alphabetical':
        orderBy = { name: 'asc' };
        break;
      case 'random':
        // Random sorting will be handled in memory
        break;
      default:
        // Default: sticky first, then by published_at desc
        orderBy = [
          { global_sticky_order: 'desc' },
          { category_sticky_order: 'desc' },
          { published_at: 'desc' },
        ];
    }

    const resources = (await db.resource.findMany({
      where,
      orderBy: sort === 'random' ? undefined : orderBy,
      select: {
        id: true,
        name: true,
        description: true,
        url: true,
        category: true,
        price: true,
        is_open_source: true,
        global_sticky_order: true,
        category_sticky_order: true,
        published_at: true,
      },
    })) as ResourceListItem[];

    // Handle random sorting
    let result = resources;
    if (sort === 'random') {
      // Keep sticky items at the top, randomize the rest
      const stickyItems = resources.filter(
        (r) => r.global_sticky_order > 0 || r.category_sticky_order > 0
      );
      const nonStickyItems = resources.filter(
        (r) => r.global_sticky_order === 0 && r.category_sticky_order === 0
      );
      
      // Sort sticky items by their order
      stickyItems.sort((a, b) => {
        if (a.global_sticky_order !== b.global_sticky_order) {
          return b.global_sticky_order - a.global_sticky_order;
        }
        return b.category_sticky_order - a.category_sticky_order;
      });
      
      // Shuffle non-sticky items
      const shuffled = [...nonStickyItems].sort(() => Math.random() - 0.5);
      result = [...stickyItems, ...shuffled];
    } else {
      // Ensure sticky items are at the top for other sorts too
      const stickyItems = resources.filter(
        (r) => r.global_sticky_order > 0 || r.category_sticky_order > 0
      );
      const nonStickyItems = resources.filter(
        (r) => r.global_sticky_order === 0 && r.category_sticky_order === 0
      );
      
      // Sort sticky items
      stickyItems.sort((a, b) => {
        if (a.global_sticky_order !== b.global_sticky_order) {
          return b.global_sticky_order - a.global_sticky_order;
        }
        return b.category_sticky_order - a.category_sticky_order;
      });
      
      result = [...stickyItems, ...nonStickyItems];
    }

    return NextResponse.json({
      resources: result,
      total: result.length,
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    // Return mock data when DB connection fails (e.g. no internet/DNS)
    return NextResponse.json({
      resources: MOCK_RESOURCES,
      total: MOCK_RESOURCES.length,
      warning: 'Using mock data due to database connection error'
    });
  }
}
