import { NextRequest, NextResponse } from 'next/server';
import { feedbackStatusSchema } from '@/lib/validations';
import { submitFeedbackStatus } from '@/services/feedback.service';
import { getCandidateById } from '@/services/candidate.service';
import { validateBearerToken, getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    let user = await validateBearerToken(authHeader);
    if (!user) user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = feedbackStatusSchema.safeParse(body.feedbackStatus ?? body.feedback_status);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.errors },
        { status: 400 }
      );
    }
    const feedbackStatus = result.data;

    const existing = await getCandidateById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    await submitFeedbackStatus(id, user.email, feedbackStatus);

    return NextResponse.json({
      success: true,
      message: 'Action recorded successfully',
    });
  } catch (error) {
    console.error('Submit feedback status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
