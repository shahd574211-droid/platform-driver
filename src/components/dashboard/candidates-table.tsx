'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { formatDate, getStatusColor, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface CallFeedbackItem {
  agentEmail: string;
  callStatus?: string;
}

interface Candidate {
  id: string;
  whatsappPhoneNumber: string;
  captainNumber: string | null;
  cityName: string;
  status: string;
  carStatus: string | null;
  selfieUrl: string | null;
  assignedTo: string | null;
  currentlyViewingBy: string | null;
  createdAt: string;
  callFeedbacks?: CallFeedbackItem[];
}

interface CandidatesTableProps {
  candidates: Candidate[];
  isLoading: boolean;
  onAction: (candidate: Candidate) => void;
  currentUserEmail: string;
  scrollToCandidateId?: string | null;
  onScrollDone?: () => void;
}

function updatedBy(candidate: Candidate): string | null {
  const v = candidate.assignedTo;
  return v && String(v).trim() ? String(v).trim() : null;
}

function editedCallStatusByAgents(candidate: Candidate): string[] {
  const feedbacks = candidate.callFeedbacks ?? [];
  const assigned = candidate.assignedTo?.trim() || null;
  const distinct = [...new Set(feedbacks.map((f) => f.agentEmail).filter(Boolean))];
  if (distinct.length >= 2) {
    return distinct.filter((email) => email !== assigned);
  }
  if (distinct.length === 1 && feedbacks.length >= 2) {
    return [distinct[0]];
  }
  return [];
}

function CopyableCell({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!value || copied) return;
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        toast({ title: 'Copied!', description: value, variant: 'success' });
        setTimeout(() => setCopied(false), 1500);
      });
    },
    [value, copied, toast]
  );
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick(e as unknown as React.MouseEvent)}
      className={cn('cursor-pointer select-all hover:bg-gray-100 rounded px-1 -mx-1', className)}
      title="Click to copy"
    >
      {children}
    </span>
  );
}

export function CandidatesTable({
  candidates,
  isLoading,
  onAction,
  currentUserEmail,
  scrollToCandidateId,
  onScrollDone,
}: CandidatesTableProps) {
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    if (!scrollToCandidateId || !tableBodyRef.current || candidates.length === 0) return;
    const row = tableBodyRef.current.querySelector(
      `tr[data-candidate-id="${scrollToCandidateId}"]`
    );
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    onScrollDone?.();
  }, [scrollToCandidateId, candidates.length, onScrollDone]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p className="text-lg font-medium">No candidates found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <table className="ant-table">
        <thead>
          <tr>
            <th className="w-12"></th>
            <th>Phone Number</th>
            <th>Captain #</th>
            <th>City</th>
            <th>Car Status</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Updated by</th>
            <th>Edited call status by</th>
            <th className="w-24">Action</th>
          </tr>
        </thead>
        <tbody ref={tableBodyRef}>
          {candidates.map((candidate) => (
            <tr
              key={candidate.id}
              data-candidate-id={candidate.id}
              className="group cursor-pointer"
              onClick={() => onAction(candidate)}
            >
              <td>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={candidate.selfieUrl || ''} />
                  <AvatarFallback className="text-xs">
                    {getInitials(candidate.whatsappPhoneNumber.slice(-4))}
                  </AvatarFallback>
                </Avatar>
              </td>
              <td className="font-medium">
                <CopyableCell value={candidate.whatsappPhoneNumber}>
                  {candidate.whatsappPhoneNumber}
                </CopyableCell>
              </td>
              <td className="text-gray-600">
                {candidate.captainNumber ? (
                  <CopyableCell value={candidate.captainNumber}>
                    {candidate.captainNumber}
                  </CopyableCell>
                ) : (
                  '—'
                )}
              </td>
              <td>{candidate.cityName}</td>
              <td>
                <span className="text-gray-600">
                  {candidate.carStatus || 'N/A'}
                </span>
              </td>
              <td>
                <span
                  className={cn(
                    'ant-tag',
                    getStatusColor(candidate.status)
                  )}
                >
                  {candidate.status.replace('_', ' ')}
                </span>
              </td>
              <td className="text-gray-500 text-sm">
                {formatDate(candidate.createdAt)}
              </td>
              <td>
                <span
                  className={cn(
                    'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap max-w-[180px] truncate',
                    updatedBy(candidate)
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  )}
                  title={updatedBy(candidate) ?? 'No one'}
                >
                  {updatedBy(candidate) ?? 'No one'}
                </span>
              </td>
              <td>
                {(() => {
                  const others = editedCallStatusByAgents(candidate);
                  if (others.length === 0) {
                    return (
                      <span
                        className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap bg-red-100 text-red-800 border border-red-200"
                        title="No one"
                      >
                        No one
                      </span>
                    );
                  }
                  return (
                    <div className="flex flex-wrap gap-1 max-w-[240px]">
                      {others.map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 truncate max-w-[200px]"
                          title={email}
                        >
                          {email}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </td>
              <td onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAction(candidate)}
                  className="hover:border-primary hover:text-primary"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Action
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
