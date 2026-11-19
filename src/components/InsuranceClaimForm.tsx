'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useForm } from '@/hooks/useForm';
import { randomHexUpper } from '@/lib/crypto/ids';
import { apiPatch } from '@/lib/api/client';
import {
  type InsuranceClaimFormProps,
  insuranceClaimSchema,
} from './insurance-claim/types';
import { ClaimFormHeader } from './insurance-claim/ClaimFormHeader';
import { EligibilityState } from './insurance-claim/EligibilityState';
import { ClaimFormFields } from './insurance-claim/ClaimFormFields';

export * from './insurance-claim/types';

export function InsuranceClaimForm({
  transactionId,
  insuranceId,
  coverage,
  onSuccess,
  onCancel,
}: InsuranceClaimFormProps) {
  const [fileError, setFileError] = useState<string | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const {
    values,
    isSubmitting: loading,
    submitError,
    errors,
    setFieldValue,
    setSubmitError,
    handleSubmit: submitForm,
  } = useForm({
    initialValues: {
      reason: '',
      evidence: '',
    },
    schema: insuranceClaimSchema,
    onSubmit: async (formValues) => {
      if (!isEligible) return;

      if (insuranceId.startsWith('ins_')) {
        await new Promise((r) => setTimeout(r, 1000));
        onSuccess(`CLAIM-${Date.now()}-${randomHexUpper(4)}`);
        return;
      }

      const data = await apiPatch<{ claim?: { claim_id?: string; id?: string } }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/insurance`,
        {
          insuranceId,
          reason: formValues.reason,
          evidence: formValues.evidence || undefined,
        },
      );

      const claimId = data?.claim?.claim_id ?? data?.claim?.id ?? 'CLAIM-FILED';
      onSuccess(claimId);
    },
  });

  const error = fileError || submitError || errors.reason;

  useEffect(() => {
    const check = async () => {
      setIsCheckingEligibility(true);
      await new Promise((r) => setTimeout(r, 1500));
      setIsEligible(true);
      setIsCheckingEligibility(false);
    };
    check();
  }, [insuranceId]);

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusables = dialog?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    return () => {
      previouslyFocusedRef.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  const handleFileSelect = (file: File) => {
    setFileError(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!values.reason || !isEligible) return;
    setFileError(null);
    setSubmitError(null);
    await submitForm(e);
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-form-title"
      aria-describedby="claim-form-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md border border-[#333333] bg-[#0a0a0a] p-6 flex flex-col gap-5 shadow-2xl">
        <p id="claim-form-description" className="sr-only">
          File an insurance claim for this transaction. Use Tab to move between
          fields and Escape to cancel.
        </p>
        <ClaimFormHeader coverage={coverage} onCancel={onCancel} />

        {isCheckingEligibility || !isEligible ? (
          <EligibilityState
            isChecking={isCheckingEligibility}
            isEligible={isEligible}
            onCancel={onCancel}
          />
        ) : (
          <ClaimFormFields
            reason={values.reason}
            evidence={values.evidence}
            error={error}
            loading={loading}
            selectedFile={selectedFile}
            filePreview={filePreview}
            onReasonChange={(val) => setFieldValue('reason', val)}
            onEvidenceChange={(val) => setFieldValue('evidence', val)}
            onFileSelect={handleFileSelect}
            onFileError={setFileError}
            onSubmit={handleSubmit}
            onCancel={onCancel}
          />
        )}
      </div>
    </div>
  );
}

