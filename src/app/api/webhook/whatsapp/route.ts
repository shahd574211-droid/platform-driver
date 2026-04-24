import { NextRequest, NextResponse } from 'next/server';
import { whatsappWebhookSchema } from '@/lib/validations';
import { createCandidate } from '@/services/candidate.service';
import { validateBearerToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const secretHeader = request.headers.get('x-webhook-secret');
    const authHeader = request.headers.get('authorization');

    let authorized = false;
    if (webhookSecret && secretHeader === webhookSecret) {
      authorized = true;
    } else if (authHeader?.startsWith('Bearer ')) {
      const user = await validateBearerToken(authHeader);
      authorized = !!user;
    }

    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Use X-Webhook-Secret or Authorization: Bearer <token>' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validationResult = whatsappWebhookSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const candidate = await createCandidate({
      whatsappPhoneNumber: data.whatsapp_phone_number,
      cityName: data.city_name,
      captainNumber: data.captain_number ?? null,
      nidFrontUrl: data.nid_front_url,
      nidBackUrl: data.nid_back_url,
      driverLicenseUrl: data.driver_license_url,
      selfieUrl: data.selfie_url,
      verificationVideoUrl: data.verification_video_url,
      carStatus: data.car_status,
      carModel: data.car_model,
      carYear: data.car_year,
    });

    return NextResponse.json(
      { success: true, candidateId: candidate.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
