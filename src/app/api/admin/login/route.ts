import { NextRequest, NextResponse } from 'next/server';
import { LoginSchema } from '@/lib/validation';
import { generateJWT, logAdminAction } from '@/lib/auth';
import { verifyPassword } from '@/lib/crypto-node';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = LoginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '密码不能为空' },
        { status: 400 }
      );
    }

    const { password } = validationResult.data;

    // Verify password against hashed password in environment
    const isValid = verifyPassword(password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      );
    }

    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';

    // Generate JWT token
    const token = await generateJWT(ip);

    // Log login action
    await logAdminAction(request, 'LOGIN', null);

    // Set cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
