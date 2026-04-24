import { NextRequest, NextResponse } from 'next/server';
import { createCallFeedbackSchema } from '@/lib/validations';
import { createCallFeedback } from '@/services/feedback.service';
import { getCandidateById } from '@/services/candidate.service';
import { validateBearerToken, getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const authHeader = request.headers.get('authorization');
    let user = await validateBearerToken(authHeader);
    
    if (!user) {
      user = await getCurrentUser();
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = createCallFeedbackSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if candidate exists
    const candidate = await getCandidateById(data.candidateId);
    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Create feedback
    const feedback = await createCallFeedback({
      candidateId: data.candidateId,
      agentEmail: user.email,
      callStatus: data.callStatus,
      note: data.note,
    });

    return NextResponse.json(
      { success: true, feedback },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create feedback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
