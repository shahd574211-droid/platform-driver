'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { CandidatesTable } from '@/components/dashboard/candidates-table';
import type { Candidate as TableCandidate } from '@/components/dashboard/candidates-table';
import { CandidateModal } from '@/components/dashboard/candidate-modal';
import { Pagination } from '@/components/dashboard/pagination';
import { useCandidates, useCandidate } from '@/hooks/use-candidates';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading: isAuthLoading } = useAuth();

  const [status, setStatus] = useState('ALL');
  const [registrationStep, setRegistrationStep] = useState('ALL');
  const [callStatus, setCallStatus] = useState('ALL');
  const [carStatus, setCarStatus] = useState('ALL');
  const [city, setCity] = useState('ALL');
  const [completed, setCompleted] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [whatsappPhoneInput, setWhatsappPhoneInput] = useState('');
  const [whatsappPhoneFilter, setWhatsappPhoneFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedCandidateFromList, setSelectedCandidateFromList] = useState<TableCandidate | null>(null);
  const [scrollToCandidateId, setScrollToCandidateId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useCandidates({
    status,
    registrationStep,
    callStatus,
    carStatus,
    city,
    completed,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    whatsappPhone: whatsappPhoneFilter || undefined,
    page,
    limit: 20,
  });

  const { data: selectedCandidate, refetch: refetchCandidate } = useCandidate(selectedCandidateId);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Log agent viewing when modal opens
  useEffect(() => {
    if (selectedCandidateId && user) {
      fetch(`/api/candidates/${selectedCandidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentlyViewingBy: user.email }),
      });
    }

    return () => {
      if (selectedCandidateId && user) {
        fetch(`/api/candidates/${selectedCandidateId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentlyViewingBy: null }),
        });
      }
    };
  }, [selectedCandidateId, user]);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleRegistrationStepChange = useCallback((value: string) => {
    setRegistrationStep(value);
    setPage(1);
  }, []);

  const handleCallStatusChange = useCallback((value: string) => {
    setCallStatus(value);
    setPage(1);
  }, []);

  const handleCarStatusChange = useCallback((value: string) => {
    setCarStatus(value);
    setPage(1);
  }, []);

  const handleCityChange = useCallback((value: string) => {
    setCity(value);
    setPage(1);
  }, []);

  const handleCompletedChange = useCallback((value: string) => {
    setCompleted(value);
    setPage(1);
  }, []);

  const handleDateFromChange = useCallback((value: string) => {
    setDateFrom(value);
    setPage(1);
  }, []);

  const handleDateToChange = useCallback((value: string) => {
    setDateTo(value);
    setPage(1);
  }, []);

  const handleWhatsappPhoneSearch = useCallback(() => {
    const trimmed = whatsappPhoneInput.trim();
    setWhatsappPhoneFilter(trimmed);
    setPage(1);
    setWhatsappPhoneInput('');
  }, [whatsappPhoneInput]);

  const handleAction = useCallback((candidate: TableCandidate) => {
    setSelectedCandidateId(candidate.id);
    setSelectedCandidateFromList(candidate);
  }, []);

  const handleModalClose = useCallback(() => {
    const idToScroll = selectedCandidateId;
    setSelectedCandidateId(null);
    setSelectedCandidateFromList(null);
    if (idToScroll) setScrollToCandidateId(idToScroll);
  }, [selectedCandidateId]);

  const handleUpdate = useCallback(() => {
    refetch();
    refetchCandidate();
    queryClient.invalidateQueries({ queryKey: ['candidates'] });
  }, [refetch, refetchCandidate, queryClient]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      <main className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-6">
          <FilterBar
            status={status}
            onStatusChange={handleStatusChange}
            registrationStep={registrationStep}
            onRegistrationStepChange={handleRegistrationStepChange}
            callStatus={callStatus}
            onCallStatusChange={handleCallStatusChange}
            carStatus={carStatus}
            onCarStatusChange={handleCarStatusChange}
            city={city}
            onCityChange={handleCityChange}
            completed={completed}
            onCompletedChange={handleCompletedChange}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={handleDateFromChange}
            onDateToChange={handleDateToChange}
            whatsappPhone={whatsappPhoneInput}
            onWhatsappPhoneChange={setWhatsappPhoneInput}
            onWhatsappPhoneSearch={handleWhatsappPhoneSearch}
            cities={data?.cities || []}
            carStatuses={data?.carStatuses || []}
          />
        </div>

        {/* 2. Result */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Result
              {data != null && (
                <span className="ml-2 font-normal text-muted-foreground">
                  ({data.total} {data.total === 1 ? 'record' : 'records'})
                </span>
              )}
            </h2>
          </div>
          <CandidatesTable
            candidates={data?.data || []}
            isLoading={isLoading}
            onAction={handleAction}
            currentUserEmail={user.email}
            scrollToCandidateId={scrollToCandidateId}
            onScrollDone={() => setScrollToCandidateId(null)}
          />
        </div>

        {/* Pagination */}
        {data && data.total > 0 && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
            total={data.total}
            limit={20}
          />
        )}

        {/* Auto-refresh indicator */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Data refreshes automatically every 30 seconds
          </p>
        </div>
      </main>

      {/* Candidate Modal */}
      <CandidateModal
        candidate={selectedCandidate ?? selectedCandidateFromList ?? null}
        isOpen={!!selectedCandidateId}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
        currentUserEmail={user.email}
        cities={data?.cities ?? []}
      />
    </div>
  );
}
