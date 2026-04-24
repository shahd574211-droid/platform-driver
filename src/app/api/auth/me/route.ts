import { NextResponse } from 'next/server';
import { getCurrentUser, GUEST_USER_ID, GUEST_JWT_PAYLOAD } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.userId === GUEST_USER_ID) {
      return NextResponse.json({
        id: GUEST_USER_ID,
        email: GUEST_JWT_PAYLOAD.email,
        name: GUEST_JWT_PAYLOAD.name,
        role: GUEST_JWT_PAYLOAD.role,
        avatar: null,
      });
    }

    // Get full user details
    const fullUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });

    if (!fullUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(fullUser);
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
