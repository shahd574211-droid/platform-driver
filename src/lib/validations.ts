import { z } from 'zod';

// Auth validations
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Candidate validations
export const candidateStatusSchema = z.enum(['PENDING', 'COMPLETED', 'REJECTED', 'CALL_BACK']);

export const updateCandidateSchema = z.object({
  status: candidateStatusSchema.optional(),
  currentlyViewingBy: z.string().email().nullable().optional(),
  assignedTo: z.string().email().nullable().optional(),
  cityName: z.string().min(1).optional(),
});

// Call feedback validations
export const callStatusSchema = z.enum(['ANSWERED', 'NO_ANSWER', 'BUSY']);

export const createCallFeedbackSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required'),
  callStatus: callStatusSchema,
  note: z.string().optional(),
});

export const feedbackStatusSchema = z.enum([
  'WILL_JOIN_US',
  'NOT_INTERESTED',
  'HE_IS_CAPTAIN',
  'REJECT_GENERAL',
  'REJECT_BIKE',
]);

// WhatsApp webhook validation
export const whatsappWebhookSchema = z.object({
  whatsapp_phone_number: z.string().min(1, 'Phone number is required'),
  captain_number: z.string().optional().nullable(),
  city_name: z.string().min(1, 'City name is required'),
  nid_front_url: z.string().url().optional().nullable(),
  nid_back_url: z.string().url().optional().nullable(),
  driver_license_url: z.string().url().optional().nullable(),
  selfie_url: z.string().url().optional().nullable(),
  verification_video_url: z.string().url().optional().nullable(),
  car_status: z.string().optional().nullable(),
  car_model: z.string().optional().nullable(),
  car_year: z.string().optional().nullable(),
});

// Query params validation
export const candidateQuerySchema = z.object({
  status: candidateStatusSchema.optional(),
  registrationStep: z.string().optional(),
  callStatus: z.enum(['ANSWERED', 'NO_ANSWER', 'BUSY']).optional(),
  carStatus: z.string().optional(),
  city: z.string().optional(),
  completed: z.enum(['ALL', 'YES', 'NO']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  whatsappPhone: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;
export type CreateCallFeedbackInput = z.infer<typeof createCallFeedbackSchema>;
export type WhatsAppWebhookInput = z.infer<typeof whatsappWebhookSchema>;
export type CandidateQueryInput = z.infer<typeof candidateQuerySchema>;
