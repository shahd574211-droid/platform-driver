'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

type CallStatus = 'ANSWERED' | 'NO_ANSWER' | 'BUSY';

interface UseSubmitCallStatusOptions {
  candidateId: string | null;
  onSuccess?: () => void;
}

export function useSubmitCallStatus({
  candidateId,
  onSuccess,
}: UseSubmitCallStatusOptions) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitCallStatus = useCallback(
    async (callStatus: CallStatus) => {
      if (!candidateId || !callStatus || isSubmitting) return;
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/feedbacks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId, callStatus }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error ?? 'Failed to record call status');
        }
        toast({
          title: 'Success',
          description: 'Call status recorded successfully',
          variant: 'success',
        });
        onSuccess?.();
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to record call status',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [candidateId, isSubmitting, onSuccess, toast]
  );

  return { submitCallStatus, isSubmitting };
}
