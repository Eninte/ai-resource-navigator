import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SubmitResourceSchema } from '@/lib/validation';
import { sanitizeHTML, getClientIP } from '@/lib/security';
import { hashIp } from '@/lib/crypto-node';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const ip = getClientIP(request);
    const rateLimitKey = `submit:${ip}`;
    const rateLimit = checkRateLimit(rateLimitKey, 10, 60 * 60 * 1000); // 10 requests per hour

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: '提交过于频繁，请稍后再试',
          },
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = SubmitResourceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check for duplicate URL
    const existingResource = await prisma.resource.findFirst({
      where: {
        url: data.url,
        status: {
          in: ['pending', 'published'],
        },
      },
    });

    if (existingResource) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_URL',
            message: '该资源已存在',
          },
        },
        { status: 409 }
      );
    }

    // Sanitize description
    const sanitizedDescription = data.description
      ? sanitizeHTML(data.description)
      : null;

    // Create resource
    const resource = await prisma.resource.create({
      data: {
        name: data.name,
        url: data.url,
        description: sanitizedDescription,
        category: data.category,
        price: data.price,
        is_open_source: data.is_open_source,
        source: 'web',
        status: 'pending',
        submitter_ip: hashIp(ip),
      },
    });

    return NextResponse.json({
      success: true,
      message: '提交成功，等待审核',
      resourceId: resource.id,
    });
  } catch (error) {
    console.error('Error submitting resource:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '提交失败，请稍后重试',
        },
      },
      { status: 500 }
    );
  }
}
