import { NextRequest, NextResponse } from 'next/server';
import { candidateQuerySchema } from '@/lib/validations';
import { getCandidates, getStatusCounts, getCities, getCarStatuses } from '@/services/candidate.service';
import { validateBearerToken, getCurrentUser } from '@/lib/auth';

const demoCandidates = [
  {
    id: 'demo-1',
    whatsappPhoneNumber: '+9647712345678',
    captainNumber: 'CAP-001',
    cityName: 'Baghdad',
    status: 'PENDING',
    carStatus: 'Has Own Car',
    selfieUrl: null,
    assignedTo: 'guest@local.dev',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-20T09:00:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'guest@local.dev', callStatus: 'ANSWERED' }],
  },
  {
    id: 'demo-2',
    whatsappPhoneNumber: '+9647723456789',
    captainNumber: 'CAP-002',
    cityName: 'Basra',
    status: 'COMPLETED',
    carStatus: 'Renting',
    selfieUrl: null,
    assignedTo: 'agent@example.com',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-19T11:30:00.000Z').toISOString(),
    callFeedbacks: [
      { agentEmail: 'agent@example.com', callStatus: 'ANSWERED' },
      { agentEmail: 'admin@example.com', callStatus: 'BUSY' },
    ],
  },
  {
    id: 'demo-3',
    whatsappPhoneNumber: '+9647734567890',
    captainNumber: null,
    cityName: 'Erbil',
    status: 'CALL_BACK',
    carStatus: 'No Car',
    selfieUrl: null,
    assignedTo: null,
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-18T13:45:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'agent@example.com', callStatus: 'NO_ANSWER' }],
  },
  {
    id: 'demo-4',
    whatsappPhoneNumber: '+9647700000004',
    captainNumber: 'CAP-004',
    cityName: 'Mosul',
    status: 'PENDING',
    carStatus: 'Has Own Car',
    selfieUrl: null,
    assignedTo: 'guest@local.dev',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-17T10:00:00.000Z').toISOString(),
    callFeedbacks: [],
  },
  {
    id: 'demo-5',
    whatsappPhoneNumber: '+9647700000005',
    captainNumber: 'CAP-005',
    cityName: 'Najaf',
    status: 'COMPLETED',
    carStatus: 'Renting',
    selfieUrl: null,
    assignedTo: 'agent@example.com',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-17T09:30:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'agent@example.com', callStatus: 'BUSY' }],
  },
  {
    id: 'demo-6',
    whatsappPhoneNumber: '+9647700000006',
    captainNumber: null,
    cityName: 'Kirkuk',
    status: 'CALL_BACK',
    carStatus: 'No Car',
    selfieUrl: null,
    assignedTo: null,
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-16T15:20:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'admin@example.com', callStatus: 'NO_ANSWER' }],
  },
  {
    id: 'demo-7',
    whatsappPhoneNumber: '+9647700000007',
    captainNumber: 'CAP-007',
    cityName: 'Baghdad',
    status: 'REJECTED',
    carStatus: 'Renting',
    selfieUrl: null,
    assignedTo: 'agent@example.com',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-16T12:10:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'agent@example.com', callStatus: 'BUSY' }],
  },
  {
    id: 'demo-8',
    whatsappPhoneNumber: '+9647700000008',
    captainNumber: 'CAP-008',
    cityName: 'Basra',
    status: 'PENDING',
    carStatus: 'Has Own Car',
    selfieUrl: null,
    assignedTo: null,
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-15T11:00:00.000Z').toISOString(),
    callFeedbacks: [],
  },
  {
    id: 'demo-9',
    whatsappPhoneNumber: '+9647700000009',
    captainNumber: null,
    cityName: 'Erbil',
    status: 'CALL_BACK',
    carStatus: 'No Car',
    selfieUrl: null,
    assignedTo: 'admin@example.com',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-15T08:45:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'admin@example.com', callStatus: 'NO_ANSWER' }],
  },
  {
    id: 'demo-10',
    whatsappPhoneNumber: '+9647700000010',
    captainNumber: 'CAP-010',
    cityName: 'Baghdad',
    status: 'COMPLETED',
    carStatus: 'Has Own Car',
    selfieUrl: null,
    assignedTo: 'agent@example.com',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-14T17:40:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'agent@example.com', callStatus: 'ANSWERED' }],
  },
  {
    id: 'demo-11',
    whatsappPhoneNumber: '+9647700000011',
    captainNumber: 'CAP-011',
    cityName: 'Mosul',
    status: 'PENDING',
    carStatus: 'Renting',
    selfieUrl: null,
    assignedTo: null,
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-14T15:20:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'guest@local.dev', callStatus: 'BUSY' }],
  },
  {
    id: 'demo-12',
    whatsappPhoneNumber: '+9647700000012',
    captainNumber: null,
    cityName: 'Najaf',
    status: 'REJECTED',
    carStatus: 'No Car',
    selfieUrl: null,
    assignedTo: 'admin@example.com',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-13T13:30:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'admin@example.com', callStatus: 'NO_ANSWER' }],
  },
  {
    id: 'demo-13',
    whatsappPhoneNumber: '+9647700000013',
    captainNumber: 'CAP-013',
    cityName: 'Kirkuk',
    status: 'CALL_BACK',
    carStatus: 'Renting',
    selfieUrl: null,
    assignedTo: 'agent@example.com',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-13T09:10:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'agent@example.com', callStatus: 'BUSY' }],
  },
  {
    id: 'demo-14',
    whatsappPhoneNumber: '+9647700000014',
    captainNumber: 'CAP-014',
    cityName: 'Basra',
    status: 'PENDING',
    carStatus: 'Has Own Car',
    selfieUrl: null,
    assignedTo: null,
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-12T18:00:00.000Z').toISOString(),
    callFeedbacks: [],
  },
  {
    id: 'demo-15',
    whatsappPhoneNumber: '+9647700000015',
    captainNumber: null,
    cityName: 'Erbil',
    status: 'COMPLETED',
    carStatus: 'No Car',
    selfieUrl: null,
    assignedTo: 'agent@example.com',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-12T14:50:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'agent@example.com', callStatus: 'ANSWERED' }],
  },
  {
    id: 'demo-16',
    whatsappPhoneNumber: '+9647700000016',
    captainNumber: 'CAP-016',
    cityName: 'Baghdad',
    status: 'REJECTED',
    carStatus: 'Renting',
    selfieUrl: null,
    assignedTo: 'admin@example.com',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-11T12:15:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'admin@example.com', callStatus: 'BUSY' }],
  },
  {
    id: 'demo-17',
    whatsappPhoneNumber: '+9647700000017',
    captainNumber: 'CAP-017',
    cityName: 'Mosul',
    status: 'PENDING',
    carStatus: 'Has Own Car',
    selfieUrl: null,
    assignedTo: 'guest@local.dev',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-11T09:05:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'guest@local.dev', callStatus: 'ANSWERED' }],
  },
  {
    id: 'demo-18',
    whatsappPhoneNumber: '+9647700000018',
    captainNumber: null,
    cityName: 'Najaf',
    status: 'CALL_BACK',
    carStatus: 'No Car',
    selfieUrl: null,
    assignedTo: null,
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-10T19:35:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'agent@example.com', callStatus: 'NO_ANSWER' }],
  },
  {
    id: 'demo-19',
    whatsappPhoneNumber: '+9647700000019',
    captainNumber: 'CAP-019',
    cityName: 'Kirkuk',
    status: 'COMPLETED',
    carStatus: 'Renting',
    selfieUrl: null,
    assignedTo: 'agent@example.com',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-10T16:25:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'agent@example.com', callStatus: 'ANSWERED' }],
  },
  {
    id: 'demo-20',
    whatsappPhoneNumber: '+9647700000020',
    captainNumber: 'CAP-020',
    cityName: 'Basra',
    status: 'PENDING',
    carStatus: 'Has Own Car',
    selfieUrl: null,
    assignedTo: null,
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-09T13:10:00.000Z').toISOString(),
    callFeedbacks: [],
  },
  {
    id: 'demo-21',
    whatsappPhoneNumber: '+9647700000021',
    captainNumber: null,
    cityName: 'Erbil',
    status: 'REJECTED',
    carStatus: 'No Car',
    selfieUrl: null,
    assignedTo: 'admin@example.com',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-09T10:40:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'admin@example.com', callStatus: 'BUSY' }],
  },
  {
    id: 'demo-22',
    whatsappPhoneNumber: '+9647700000022',
    captainNumber: 'CAP-022',
    cityName: 'Baghdad',
    status: 'CALL_BACK',
    carStatus: 'Renting',
    selfieUrl: null,
    assignedTo: 'agent@example.com',
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-08T18:20:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'agent@example.com', callStatus: 'NO_ANSWER' }],
  },
  {
    id: 'demo-23',
    whatsappPhoneNumber: '+9647700000023',
    captainNumber: 'CAP-023',
    cityName: 'Mosul',
    status: 'PENDING',
    carStatus: 'Has Own Car',
    selfieUrl: null,
    assignedTo: null,
    currentlyViewingBy: null,
    createdAt: new Date('2026-04-08T12:00:00.000Z').toISOString(),
    callFeedbacks: [{ agentEmail: 'guest@local.dev', callStatus: 'ANSWERED' }],
  },
];

function buildDemoResponse(filters: {
  status?: string;
  registrationStep?: string;
  callStatus?: string;
  carStatus?: string;
  city?: string;
  completed?: string;
  dateFrom?: string;
  dateTo?: string;
  whatsappPhone?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const registrationStepFilter = filters.registrationStep;
  const callStatusFilter = filters.callStatus;
  const cityFilter = filters.city?.toLowerCase().trim();
  const phoneFilter = filters.whatsappPhone?.toLowerCase().trim();

  let filtered = demoCandidates.filter((candidate) => {
    const registrationStep = candidate.status === 'COMPLETED'
      ? 'STEP_3'
      : candidate.callFeedbacks.length > 0
        ? 'STEP_2'
        : 'STEP_1';

    if (filters.completed === 'YES' && candidate.status !== 'COMPLETED') return false;
    if (filters.completed === 'NO' && candidate.status === 'COMPLETED') return false;
    if (filters.completed !== 'YES' && filters.completed !== 'NO' && filters.status && candidate.status !== filters.status) return false;

    if (registrationStepFilter && registrationStepFilter !== 'ALL' && registrationStep !== registrationStepFilter) return false;
    if (callStatusFilter && callStatusFilter !== 'ALL' && !candidate.callFeedbacks.some((f) => f.callStatus === callStatusFilter)) return false;
    if (filters.carStatus && filters.carStatus !== 'ALL' && candidate.carStatus !== filters.carStatus) return false;
    if (cityFilter && cityFilter !== 'all' && !candidate.cityName.toLowerCase().includes(cityFilter)) return false;

    if (filters.dateFrom || filters.dateTo) {
      const createdAt = new Date(candidate.createdAt).getTime();
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        from.setHours(0, 0, 0, 0);
        if (createdAt < from.getTime()) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (createdAt > to.getTime()) return false;
      }
    }

    if (phoneFilter && !candidate.whatsappPhoneNumber.toLowerCase().includes(phoneFilter)) return false;

    return true;
  });

  filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);
  return {
    data,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    statusCounts: {
      ALL: demoCandidates.length,
      PENDING: demoCandidates.filter((c) => c.status === 'PENDING').length,
      COMPLETED: demoCandidates.filter((c) => c.status === 'COMPLETED').length,
      REJECTED: demoCandidates.filter((c) => c.status === 'REJECTED').length,
      CALL_BACK: demoCandidates.filter((c) => c.status === 'CALL_BACK').length,
    },
    cities: [...new Set(demoCandidates.map((c) => c.cityName))],
    carStatuses: [...new Set(demoCandidates.map((c) => c.carStatus).filter(Boolean))],
    isDemoData: true,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Check auth - support both cookie and bearer token
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

    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      status: searchParams.get('status') || undefined,
      registrationStep: searchParams.get('registrationStep') || undefined,
      callStatus: searchParams.get('callStatus') || undefined,
      carStatus: searchParams.get('carStatus') || undefined,
      city: searchParams.get('city') || undefined,
      completed: searchParams.get('completed') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      whatsappPhone: searchParams.get('whatsappPhone') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    // Validate query params
    const validationResult = candidateQuerySchema.safeParse(queryParams);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const filters = validationResult.data;
    
    let candidates;
    let statusCounts;
    let cities;
    let carStatuses;

    try {
      // Fetch data in parallel
      [candidates, statusCounts, cities, carStatuses] = await Promise.all([
        getCandidates(filters),
        getStatusCounts(),
        getCities(),
        getCarStatuses(),
      ]);
    } catch (error) {
      console.warn('Candidates API fallback to demo data:', error);
      return NextResponse.json(buildDemoResponse(filters));
    }

    return NextResponse.json({
      ...candidates,
      statusCounts,
      cities,
      carStatuses,
      isDemoData: false,
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
