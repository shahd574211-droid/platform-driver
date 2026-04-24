import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations';
import { createUser, generateToken, setAuthCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = await createUser(email, password, name);

    // Generate token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      { error: isDev ? message : 'Internal server error' },
      { status: 500 }
    );
  }
}
