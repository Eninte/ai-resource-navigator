import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'default';

    // Build where clause
    const where: any = {
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
    let orderBy: any = {};
    
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

    const resources = await prisma.resource.findMany({
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
    });

    // Handle random sorting
    let result = resources;
    if (sort === 'random') {
      // Keep sticky items at the top, randomize the rest
      const stickyItems = resources.filter(
        r => r.global_sticky_order > 0 || r.category_sticky_order > 0
      );
      const nonStickyItems = resources.filter(
        r => r.global_sticky_order === 0 && r.category_sticky_order === 0
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
        r => r.global_sticky_order > 0 || r.category_sticky_order > 0
      );
      const nonStickyItems = resources.filter(
        r => r.global_sticky_order === 0 && r.category_sticky_order === 0
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch resources', details: errorMessage },
      { status: 500 }
    );
  }
}
