import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple test without database first
    return NextResponse.json({
      status: 'ok',
      message: 'API is working',
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'not set',
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      status: 'error',
      error: errorMessage,
    }, { status: 500 });
  }
}
