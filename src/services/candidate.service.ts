import prisma from '@/lib/prisma';
import { CandidateStatus, CallStatus, Prisma } from '@prisma/client';

export interface CandidateFilters {
  status?: CandidateStatus;
  registrationStep?: string;
  callStatus?: CallStatus;
  carStatus?: string;
  city?: string;
  completed?: 'ALL' | 'YES' | 'NO';
  dateFrom?: string;
  dateTo?: string;
  whatsappPhone?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getCandidates(filters: CandidateFilters): Promise<PaginatedResult<any>> {
  const { status, registrationStep, callStatus, carStatus, city, completed, dateFrom, dateTo, whatsappPhone, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.CandidateWhereInput = {};
  const appendAnd = (condition: Prisma.CandidateWhereInput) => {
    if (!where.AND) {
      where.AND = [condition];
      return;
    }
    if (Array.isArray(where.AND)) {
      where.AND = [...where.AND, condition];
      return;
    }
    where.AND = [where.AND, condition];
  };

  if (completed === 'YES') {
    where.status = 'COMPLETED';
  } else if (completed === 'NO') {
    where.status = { not: 'COMPLETED' };
  } else if (status) {
    where.status = status;
  }

  if (registrationStep && registrationStep !== 'ALL') {
    // Derived registration steps (until a dedicated DB field exists):
    // STEP_1: no feedback yet
    // STEP_2: has feedback but not completed
    // STEP_3: completed
    if (registrationStep === 'STEP_1') {
      appendAnd({ callFeedbacks: { none: {} } });
    } else if (registrationStep === 'STEP_2') {
      appendAnd({ callFeedbacks: { some: {} } });
      appendAnd({ status: { not: 'COMPLETED' } });
    } else if (registrationStep === 'STEP_3') {
      appendAnd({ status: 'COMPLETED' });
    }
  }

  if (callStatus) {
    appendAnd({ callFeedbacks: { some: { callStatus } } });
  }

  if (carStatus && carStatus !== 'ALL') {
    where.carStatus = carStatus;
  }

  if (city && city !== 'ALL') {
    where.cityName = {
      contains: city,
      mode: 'insensitive',
    };
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      where.createdAt.gte = from;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      where.createdAt.lte = to;
    }
  }

  if (whatsappPhone?.trim()) {
    where.whatsappPhoneNumber = {
      contains: whatsappPhone.trim(),
      mode: 'insensitive',
    };
  }

  const [data, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        callFeedbacks: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    }),
    prisma.candidate.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCandidateById(id: string) {
  return prisma.candidate.findUnique({
    where: { id },
    include: {
      callFeedbacks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function createCandidate(data: {
  whatsappPhoneNumber: string;
  cityName: string;
  captainNumber?: string | null;
  nidFrontUrl?: string | null;
  nidBackUrl?: string | null;
  driverLicenseUrl?: string | null;
  selfieUrl?: string | null;
  verificationVideoUrl?: string | null;
  carStatus?: string | null;
  carModel?: string | null;
  carYear?: string | null;
}) {
  return prisma.candidate.create({
    data: {
      whatsappPhoneNumber: data.whatsappPhoneNumber,
      cityName: data.cityName,
      captainNumber: data.captainNumber,
      nidFrontUrl: data.nidFrontUrl,
      nidBackUrl: data.nidBackUrl,
      driverLicenseUrl: data.driverLicenseUrl,
      selfieUrl: data.selfieUrl,
      verificationVideoUrl: data.verificationVideoUrl,
      carStatus: data.carStatus,
      carModel: data.carModel,
      carYear: data.carYear,
    },
  });
}

export async function updateCandidateStatus(
  id: string,
  status: CandidateStatus,
  agentEmail: string
) {
  return prisma.candidate.update({
    where: { id },
    data: {
      status,
      assignedTo: agentEmail,
      updatedAt: new Date(),
    },
  });
}

export async function setCurrentlyViewing(id: string, agentEmail: string | null) {
  return prisma.candidate.update({
    where: { id },
    data: {
      currentlyViewingBy: agentEmail,
    },
  });
}

export async function updateCandidateCity(id: string, cityName: string) {
  return prisma.candidate.update({
    where: { id },
    data: { cityName },
  });
}

export async function clearCurrentlyViewing(agentEmail: string) {
  return prisma.candidate.updateMany({
    where: { currentlyViewingBy: agentEmail },
    data: { currentlyViewingBy: null },
  });
}

export async function getStatusCounts() {
  const counts = await prisma.candidate.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  const total = await prisma.candidate.count();

  const result: Record<string, number> = {
    ALL: total,
    PENDING: 0,
    COMPLETED: 0,
    REJECTED: 0,
    CALL_BACK: 0,
  };

  counts.forEach((item) => {
    result[item.status] = item._count.status;
  });

  return result;
}

export async function getCities() {
  const cities = await prisma.candidate.findMany({
    select: {
      cityName: true,
    },
    distinct: ['cityName'],
    orderBy: {
      cityName: 'asc',
    },
  });

  return cities.map((c) => c.cityName);
}

export async function getCarStatuses() {
  const rows = await prisma.candidate.findMany({
    where: { carStatus: { not: null } },
    select: { carStatus: true },
    distinct: ['carStatus'],
    orderBy: { carStatus: 'asc' },
  });
  return rows.map((r) => r.carStatus).filter(Boolean) as string[];
}
