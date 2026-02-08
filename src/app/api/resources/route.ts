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

    // Race DB query against 3s timeout
    const timeoutPromise = new Promise<{resources: ResourceListItem[], total: number}>((_, reject) => 
      setTimeout(() => reject(new Error('DB_TIMEOUT')), 3000)
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
