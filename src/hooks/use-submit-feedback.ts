'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

type FeedbackStatus =
  | 'WILL_JOIN_US'
  | 'NOT_INTERESTED'
  | 'HE_IS_CAPTAIN'
  | 'REJECT_GENERAL'
  | 'REJECT_BIKE';

interface UseSubmitFeedbackOptions {
  candidateId: string | null;
  onSuccess?: () => void;
}

export function useSubmitFeedback({
  candidateId,
  onSuccess,
}: UseSubmitFeedbackOptions) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = useCallback(
    async (feedbackStatus: FeedbackStatus) => {
      if (!candidateId || !feedbackStatus || isSubmitting) return;
      setIsSubmitting(true);
      try {
        const response = await fetch(
          `/api/candidates/${candidateId}/feedback`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedbackStatus }),
          }
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error ?? 'Failed to record action');
        }
        toast({
          title: 'Success',
          description: 'Action recorded successfully',
          variant: 'success',
        });
        onSuccess?.();
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to record action',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [candidateId, isSubmitting, onSuccess, toast]
  );

  return { submitFeedback, isSubmitting };
}
