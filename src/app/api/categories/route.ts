import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { is_active: true },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
