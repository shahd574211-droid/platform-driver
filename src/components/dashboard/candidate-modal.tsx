'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  formatDate,
  formatDateTime,
  getStatusColor,
  getCallStatusColor,
  getInitials,
  cn,
} from '@/lib/utils';
import {
  Phone,
  MapPin,
  Car,
  Calendar,
  User,
  FileText,
  Video,
  ImageIcon,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useSubmitFeedback } from '@/hooks/use-submit-feedback';
import { useSubmitCallStatus } from '@/hooks/use-submit-call-status';
import { useToast } from '@/components/ui/use-toast';

// ─── Constants (single source of truth for options & labels) ─────────────────
const FEEDBACK_OPTIONS = [
  { value: 'WILL_JOIN_US', label: 'Will Join Us', labelAr: 'يرغب بالانضمام' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', labelAr: 'غير مهتم' },
  { value: 'HE_IS_CAPTAIN', label: 'He is Captain', labelAr: 'هو كابتن بالفعل' },
] as const;

const CALL_STATUS_OPTIONS = [
  { value: 'ANSWERED', label: 'Answered' },
  { value: 'NO_ANSWER', label: 'No Answer' },
  { value: 'BUSY', label: 'Switch off' },
] as const;

const CALL_STATUS_LABELS: Record<string, string> = {
  ANSWERED: 'Answered',
  NO_ANSWER: 'No Answer',
  BUSY: 'Switch off',
};

const REJECT_OPTIONS = [
  { value: 'REJECT_GENERAL', label: 'رفض عام' },
  { value: 'REJECT_BIKE', label: 'دراجة' },
] as const;

function getFeedbackLabel(value: string): string {
  const opt = FEEDBACK_OPTIONS.find((o) => o.value === value);
  if (opt) return `${opt.label} (${opt.labelAr})`;
  const rejectOpt = REJECT_OPTIONS.find((o) => o.value === value);
  return rejectOpt ? rejectOpt.label : value;
}

// ─── Types ─────────────────────────────────────────────────────────────────
interface CallFeedback {
  id: string;
  agentEmail: string;
  callStatus: string;
  feedbackStatus: string | null;
  note: string | null;
  createdAt: string;
}

interface Candidate {
  id: string;
  whatsappPhoneNumber: string;
  captainNumber: string | null;
  cityName: string;
  status: string;
  carStatus: string | null;
  carModel: string | null;
  carYear: string | null;
  nidFrontUrl: string | null;
  nidBackUrl: string | null;
  driverLicenseUrl: string | null;
  selfieUrl: string | null;
  verificationVideoUrl: string | null;
  assignedTo: string | null;
  currentlyViewingBy: string | null;
  createdAt: string;
  callFeedbacks: CallFeedback[];
}

interface CandidateModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  currentUserEmail: string;
  cities: string[];
}

export function CandidateModal({
  candidate,
  isOpen,
  onClose,
  onUpdate,
  currentUserEmail,
  cities = [],
}: CandidateModalProps) {
  const [feedbackValue, setFeedbackValue] = useState('');
  const [callStatusValue, setCallStatusValue] = useState('');
  const [isUpdatingCity, setIsUpdatingCity] = useState(false);

  const mediaItems = useMemo(
    () =>
      candidate
        ? [
            { label: 'NID Front', url: candidate.nidFrontUrl, icon: FileText },
            { label: 'NID Back', url: candidate.nidBackUrl, icon: FileText },
            { label: 'Driver License', url: candidate.driverLicenseUrl, icon: Car },
            { label: 'Selfie', url: candidate.selfieUrl, icon: User },
          ]
        : [],
    [candidate]
  );

  const handleFeedbackSuccess = useCallback(() => {
    onUpdate();
  }, [onUpdate]);

  const handleCallStatusSuccess = useCallback(() => {
    onUpdate();
  }, [onUpdate]);

  const { submitFeedback, isSubmitting: isSubmittingFeedback } = useSubmitFeedback({
    candidateId: candidate?.id ?? null,
    onSuccess: handleFeedbackSuccess,
  });

  const { submitCallStatus, isSubmitting: isSubmittingCall } = useSubmitCallStatus({
    candidateId: candidate?.id ?? null,
    onSuccess: handleCallStatusSuccess,
  });

  const handleClose = useCallback(() => onClose(), [onClose]);
  const { toast } = useToast();
  const handleCopy = useCallback(
    (text: string) => {
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        toast({ title: 'Copied!', description: text, variant: 'success' });
      });
    },
    [toast]
  );

  const handleFeedbackSelect = useCallback(
    (value: string) => {
      submitFeedback(value as Parameters<typeof submitFeedback>[0]);
    },
    [submitFeedback]
  );

  const handleCallStatusSelect = useCallback(
    (value: string) => {
      submitCallStatus(value as Parameters<typeof submitCallStatus>[0]);
    },
    [submitCallStatus]
  );

  const handleCityByAgentChange = useCallback(
    async (value: string) => {
      if (!candidate?.id || !value.trim()) return;
      setIsUpdatingCity(true);
      try {
        const response = await fetch(`/api/candidates/${candidate.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cityName: value }),
          credentials: 'include',
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? 'Failed to update city');
        toast({
          title: 'Success',
          description: 'City updated successfully',
          variant: 'success',
        });
        onUpdate();
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update city',
          variant: 'destructive',
        });
      } finally {
        setIsUpdatingCity(false);
      }
    },
    [candidate?.id, toast, onUpdate]
  );

  const isSubmittingAny = isSubmittingFeedback || isSubmittingCall;

  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3" asChild>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={candidate.selfieUrl ?? ''} alt="" />
                <AvatarFallback aria-hidden>
                  {getInitials('CD')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-lg font-semibold truncate">
                  {candidate.whatsappPhoneNumber}
                </p>
                <p className="text-sm text-muted-foreground font-normal">
                  Viewing by: {currentUserEmail}
                </p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-3" role="tablist">
            <TabsTrigger value="details" role="tab">
              Details
            </TabsTrigger>
            <TabsTrigger value="media" role="tab">
              Media
            </TabsTrigger>
            <TabsTrigger value="history" role="tab">
              Feedback Details ({candidate.callFeedbacks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4" role="tabpanel">
            {/* Candidate info */}
            <section className="grid grid-cols-2 gap-4" aria-label="Candidate information">
              <InfoRow
                icon={Phone}
                label="Phone"
                value={candidate.whatsappPhoneNumber}
                onCopy={handleCopy}
              />
              <InfoRow icon={MapPin} label="City" value={candidate.cityName} />
              {candidate.captainNumber && (
                <InfoRow
                  icon={User}
                  label="رقم الكابتن"
                  value={candidate.captainNumber}
                  onCopy={handleCopy}
                />
              )}
              <InfoRow
                icon={Car}
                label="Car"
                value={`${candidate.carModel ?? 'N/A'} ${candidate.carYear ? `(${candidate.carYear})` : ''}`.trim()}
              />
              <InfoRow
                icon={Calendar}
                label="Created"
                value={formatDate(candidate.createdAt)}
              />
            </section>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Current Status:</span>
              <span
                className={cn('ant-tag', getStatusColor(candidate.status))}
                role="status"
              >
                {candidate.status.replace('_', ' ')}
              </span>
            </div>

            {/* Call status */}
            <section className="border-t pt-4" aria-label="Call status">
              <Label className="text-base font-medium">Call Status</Label>
              <Select
                value={callStatusValue}
                onValueChange={handleCallStatusSelect}
                disabled={isSubmittingCall}
              >
                <SelectTrigger className="w-full max-w-sm mt-2" aria-label="Select call status">
                  <SelectValue placeholder="Select call status..." />
                </SelectTrigger>
                <SelectContent>
                  {CALL_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>

            {/* City by agent */}
            <section className="border-t pt-4" aria-label="City by agent">
              <Label className="text-base font-medium">City by agent</Label>
              <Select
                value={candidate.cityName}
                onValueChange={handleCityByAgentChange}
                disabled={isUpdatingCity}
              >
                <SelectTrigger className="w-full max-w-sm mt-2" aria-label="Select city by agent">
                  <SelectValue placeholder="Select city..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    new Set([candidate.cityName, ...cities].filter(Boolean))
                  )
                    .sort((a, b) => a.localeCompare(b))
                    .map((cityName) => (
                      <SelectItem key={cityName} value={cityName}>
                        {cityName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {isUpdatingCity && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1" role="status">
                  <Loader2 className="h-3 w-3 animate-spin shrink-0" aria-hidden />
                  Updating...
                </p>
              )}
            </section>

            {/* Feedback status */}
            <section className="border-t pt-4" aria-label="Feedback status">
              <Label className="text-base font-medium">Feedback Status</Label>
              <Select
                value={feedbackValue}
                onValueChange={handleFeedbackSelect}
                disabled={isSubmittingFeedback}
              >
                <SelectTrigger className="w-full max-w-sm mt-2" aria-label="Select feedback status">
                  <SelectValue placeholder="Select feedback status..." />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label} ({opt.labelAr})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>

            {isSubmittingAny && (
              <p
                className="text-xs text-muted-foreground flex items-center gap-1"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="h-3 w-3 animate-spin shrink-0" aria-hidden />
                Recording...
              </p>
            )}

            {/* Reject actions – end of details */}
            <DialogFooter className="border-t pt-4 flex justify-end sm:justify-end gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isSubmittingFeedback}
                    className="bg-red-600 hover:bg-red-700 text-white transition-colors"
                    aria-label="رفض - Reject (choose reason)"
                    aria-haspopup="menu"
                  >
                    {isSubmittingFeedback ? (
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    ) : (
                      <>
                        رفض (Reject)
                        <ChevronDown className="h-4 w-4 ml-1 shrink-0" aria-hidden />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48" role="menu">
                  {REJECT_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onSelect={() => handleFeedbackSelect(opt.value)}
                      className="cursor-pointer"
                      role="menuitem"
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="media" className="mt-4" role="tabpanel">
            <MediaTab mediaItems={mediaItems} candidate={candidate} />
          </TabsContent>

          <TabsContent value="history" className="mt-4" role="tabpanel">
            <HistoryTab feedbacks={candidate.callFeedbacks} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-components (clear separation, easier to maintain) ───────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
  onCopy,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onCopy?: (text: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
      <span className="text-muted-foreground">{label}:</span>
      {onCopy ? (
        <span
          role="button"
          tabIndex={0}
          onClick={() => onCopy(value)}
          onKeyDown={(e) => e.key === 'Enter' && onCopy(value)}
          className="font-medium truncate cursor-pointer select-all hover:bg-muted rounded px-1 -mx-1"
          title="Click to copy"
        >
          {value}
        </span>
      ) : (
        <span className="font-medium truncate">{value}</span>
      )}
    </div>
  );
}

function MediaTab({
  mediaItems,
  candidate,
}: {
  mediaItems: Array<{ label: string; url: string | null; icon: React.ComponentType<{ className?: string }> }>;
  candidate: Candidate;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {mediaItems.map((item) => (
          <div
            key={item.label}
            className="border rounded-lg p-4 flex flex-col items-center gap-2"
          >
            <item.icon className="h-5 w-5 text-muted-foreground" aria-hidden />
            <span className="text-sm font-medium">{item.label}</span>
            {item.url ? (
              <div className="relative w-full h-40 bg-muted rounded overflow-hidden">
                <Image
                  src={item.url}
                  alt={item.label}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-40 bg-muted rounded flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground/50" aria-hidden />
              </div>
            )}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
              >
                View Full Size
              </a>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Video className="h-5 w-5 text-muted-foreground" aria-hidden />
          <span className="font-medium">Verification Video</span>
        </div>
        {candidate.verificationVideoUrl ? (
          <div className="bg-muted rounded overflow-hidden">
            <video
              src={candidate.verificationVideoUrl}
              controls
              className="w-full max-h-64"
              preload="metadata"
            />
          </div>
        ) : (
          <div className="h-32 bg-muted rounded flex items-center justify-center">
            <p className="text-muted-foreground">No video uploaded</p>
          </div>
        )}
      </div>
    </>
  );
}

function HistoryTab({ feedbacks }: { feedbacks: CallFeedback[] }) {
  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" role="status">
        <p>No history yet</p>
      </div>
    );
  }
  return (
    <div className="border rounded-lg overflow-hidden" role="list">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left font-medium p-3">Created By</th>
            <th className="text-left font-medium p-3">Call Status</th>
            <th className="text-left font-medium p-3">Feedback</th>
            <th className="text-left font-medium p-3">Created At</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((feedback) => (
            <tr key={feedback.id} className="border-b last:border-0" role="listitem">
              <td className="p-3 text-muted-foreground">{feedback.agentEmail}</td>
              <td className="p-3">
                <span className={cn('ant-tag', getCallStatusColor(feedback.callStatus))}>
                  {CALL_STATUS_LABELS[feedback.callStatus] ?? feedback.callStatus.replace('_', ' ')}
                </span>
              </td>
              <td className="p-3 text-foreground">
                {feedback.feedbackStatus && feedback.feedbackStatus.trim() !== ''
                  ? getFeedbackLabel(feedback.feedbackStatus)
                  : '—'}
              </td>
              <td className="p-3 text-muted-foreground">
                {formatDateTime(feedback.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
