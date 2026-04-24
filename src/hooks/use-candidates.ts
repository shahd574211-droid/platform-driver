'use client';

import { useQuery } from '@tanstack/react-query';

interface CandidateFilters {
  status?: string;
  registrationStep?: string;
  callStatus?: string;
  carStatus?: string;
  city?: string;
  completed?: string;
  dateFrom?: string;
  dateTo?: string;
  whatsappPhone?: string;
  page: number;
  limit: number;
}

export function useCandidates(filters: CandidateFilters) {
  const queryParams = new URLSearchParams();
  
  if (filters.status && filters.status !== 'ALL') {
    queryParams.set('status', filters.status);
  }
  if (filters.registrationStep && filters.registrationStep !== 'ALL') {
    queryParams.set('registrationStep', filters.registrationStep);
  }
  if (filters.callStatus && filters.callStatus !== 'ALL') {
    queryParams.set('callStatus', filters.callStatus);
  }
  if (filters.carStatus && filters.carStatus !== 'ALL') {
    queryParams.set('carStatus', filters.carStatus);
  }
  if (filters.city && filters.city !== 'ALL') {
    queryParams.set('city', filters.city);
  }
  if (filters.completed && filters.completed !== 'ALL') {
    queryParams.set('completed', filters.completed);
  }
  if (filters.dateFrom) {
    queryParams.set('dateFrom', filters.dateFrom);
  }
  if (filters.dateTo) {
    queryParams.set('dateTo', filters.dateTo);
  }
  if (filters.whatsappPhone?.trim()) {
    queryParams.set('whatsappPhone', filters.whatsappPhone.trim());
  }
  queryParams.set('page', filters.page.toString());
  queryParams.set('limit', filters.limit.toString());

  return useQuery({
    queryKey: ['candidates', filters],
    queryFn: async () => {
      const response = await fetch(`/api/candidates?${queryParams.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      
      return response.json();
    },
    refetchInterval: 30000, // Auto-refetch every 30 seconds
  });
}

export function useCandidate(id: string | null) {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      if (!id) return null;
      
      const response = await fetch(`/api/candidates/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch candidate');
      }
      
      return response.json();
    },
    enabled: !!id,
  });
}
