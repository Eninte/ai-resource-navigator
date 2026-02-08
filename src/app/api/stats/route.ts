import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';

const MOCK_STATS: Record<string, number> = {
  'foundation-models': 3,
  'coding': 1,
  'image': 2,
  'writing': 2,
  'office': 1,
  'knowledge': 1,
  'research': 1,
  'robotics': 0,
  'entertainment': 1,
};

export async function GET() {
  try {
    const timeoutPromise = new Promise<Record<string, number>>((_, reject) =>
      setTimeout(() => reject(new Error('DB_TIMEOUT')), 10000)
    );

    const dbQuery = async () => {
      const counts = await db.resource.groupBy({
        by: ['category'],
        where: {
          status: 'published',
        },
        _count: {
          _all: true,
        },
      });

      const stats: Record<string, number> = {};
      counts.forEach((item) => {
        stats[item.category] = (item as { _count: { _all: number } })._count._all;
      });
      return stats;
    };

    const stats = await Promise.race([dbQuery(), timeoutPromise]);

    return NextResponse.json(stats);
  } catch (error) {
    console.warn('Stats API Error or Timeout:', error);
    // Return mock stats on error/timeout
    return NextResponse.json(MOCK_STATS);
  }
}
