import prisma from '@/lib/prisma';
import { CallStatus } from '@prisma/client';
import { CandidateStatus } from '@prisma/client';

export type FeedbackStatusType =
  | 'WILL_JOIN_US'
  | 'NOT_INTERESTED'
  | 'HE_IS_CAPTAIN'
  | 'REJECT_GENERAL'
  | 'REJECT_BIKE';

const FEEDBACK_TO_CANDIDATE_STATUS: Record<FeedbackStatusType, CandidateStatus> = {
  WILL_JOIN_US: 'COMPLETED',
  NOT_INTERESTED: 'REJECTED',
  HE_IS_CAPTAIN: 'COMPLETED',
  REJECT_GENERAL: 'REJECTED',
  REJECT_BIKE: 'REJECTED',
};

export async function createCallFeedback(data: {
  candidateId: string;
  agentEmail: string;
  callStatus: CallStatus;
  note?: string;
  feedbackStatus?: string | null;
}) {
  return prisma.callFeedback.create({
    data: {
      candidateId: data.candidateId,
      agentEmail: data.agentEmail,
      callStatus: data.callStatus,
      note: data.note,
      feedbackStatus: data.feedbackStatus,
    },
  });
}

export async function submitFeedbackStatus(
  candidateId: string,
  agentEmail: string,
  feedbackStatus: FeedbackStatusType
) {
  const newStatus = FEEDBACK_TO_CANDIDATE_STATUS[feedbackStatus];

  const existingWithoutFeedback = await prisma.callFeedback.findFirst({
    where: { candidateId, feedbackStatus: null },
    orderBy: { createdAt: 'desc' },
  });

  if (existingWithoutFeedback) {
    const [candidate, feedback] = await prisma.$transaction([
      prisma.candidate.update({
        where: { id: candidateId },
        data: { status: newStatus, assignedTo: agentEmail },
      }),
      prisma.callFeedback.update({
        where: { id: existingWithoutFeedback.id },
        data: { feedbackStatus },
      }),
    ]);
    return { candidate, feedback };
  }

  const [candidate, feedback] = await prisma.$transaction([
    prisma.candidate.update({
      where: { id: candidateId },
      data: { status: newStatus, assignedTo: agentEmail },
    }),
    prisma.callFeedback.create({
      data: {
        candidateId,
        agentEmail,
        callStatus: 'ANSWERED',
        feedbackStatus,
      },
    }),
  ]);
  return { candidate, feedback };
}

export async function getCallFeedbacksByCandidateId(candidateId: string) {
  return prisma.callFeedback.findMany({
    where: { candidateId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRecentFeedbacksByAgent(agentEmail: string, limit = 10) {
  return prisma.callFeedback.findMany({
    where: { agentEmail },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      candidate: {
        select: {
          whatsappPhoneNumber: true,
          cityName: true,
        },
      },
    },
  });
}
