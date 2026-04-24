import { NextRequest, NextResponse } from 'next/server';
import { updateCandidateSchema } from '@/lib/validations';
import { getCandidateById, updateCandidateStatus, setCurrentlyViewing, updateCandidateCity } from '@/services/candidate.service';
import { validateBearerToken, getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const candidate = await getCandidateById(id);

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(candidate);
  } catch (error) {
    console.error('Get candidate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = updateCandidateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if candidate exists
    const existingCandidate = await getCandidateById(id);
    if (!existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    let updatedCandidate;

    if (data.status) {
      updatedCandidate = await updateCandidateStatus(id, data.status, user.email);
    }

    if (data.currentlyViewingBy !== undefined) {
      updatedCandidate = await setCurrentlyViewing(id, data.currentlyViewingBy);
    }

    if (data.cityName !== undefined) {
      updatedCandidate = await updateCandidateCity(id, data.cityName);
    }

    return NextResponse.json({
      success: true,
      candidate: updatedCandidate || existingCandidate,
    });
  } catch (error) {
    console.error('Update candidate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
