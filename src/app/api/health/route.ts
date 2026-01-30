import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({
      status: 'ok',
      message: 'API and database are working',
      database: 'connected',
      result,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlHost: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).host : 'not set',
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: errorMessage,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlHost: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).host : 'not set',
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
