import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';
import { getClientIP } from '@/lib/security';
import { hashIp } from '@/lib/crypto-node';
import { verifyToken } from '@/lib/url-security';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Anti-scraping: Verify token
    if (!token || !(await verifyToken(token, id))) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 403 }
      );
    }

    // Find the resource
    const resource = await db.resource.findUnique({
      where: {
        id,
        status: 'published',
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Check cookie consent
    const cookieConsent = request.cookies.get('cookie-consent')?.value;
    const hasConsent = cookieConsent === 'accepted';

    // Record click if consent is given
    if (hasConsent) {
      const ip = getClientIP(request);
      const userAgent = request.headers.get('user-agent');
      const referrer = request.headers.get('referer');

      await db.click.create({
        data: {
          resource_id: id,
          ip_hash: hashIp(ip),
          user_agent: userAgent,
          referrer: referrer,
        },
      });
    }

    // Redirect to the resource URL
    return NextResponse.redirect(resource.url, 302);
  } catch (error) {
    console.error('Error in go API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
