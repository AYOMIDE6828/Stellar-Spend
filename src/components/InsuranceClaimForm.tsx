'use client';

import {
  type InsuranceClaimFormProps,
} from './insurance-claim/types';
import { ClaimFormHeader } from './insurance-claim/ClaimFormHeader';
import { EligibilityState } from './insurance-claim/EligibilityState';
import { ClaimFormFields } from './insurance-claim/ClaimFormFields';
import { useInsuranceClaimForm } from '@/hooks/useInsuranceClaimForm';

export * from './insurance-claim/types';

export function InsuranceClaimForm({
  transactionId,
  insuranceId,
  coverage,
  onSuccess,
  onCancel,
}: InsuranceClaimFormProps) {
  const {
    values,
    error,
    loading,
    isCheckingEligibility,
    isEligible,
    selectedFile,
    filePreview,
    setFieldValue,
    setFileError,
    handleFileSelect,
    handleSubmit,
  } = useInsuranceClaimForm({
    transactionId,
    insuranceId,
    onSuccess,
    onCancel,
  });

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

