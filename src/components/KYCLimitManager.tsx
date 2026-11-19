'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { z } from 'zod';
import { KYCLimitService, KYCStatus, LimitTier, UserLimits, LimitIncreaseRequest } from '@/lib/kyc-limits';
import { Button, Card } from '@/components/design-system';
import { useForm } from '@/hooks/useForm';

interface KYCLimitManagerProps {
  userId: string;
}

const kycFormSchema = z.object({
  documentType: z.string().min(1),
  documentId: z.string().min(1, 'Document ID is required'),
});

export function KYCLimitManager({ userId }: KYCLimitManagerProps) {
  const [kycStatus, setKycStatus] = useState<KYCStatus>('unverified');
  const [limits, setLimits] = useState<UserLimits | null>(null);
  const [showKYCForm, setShowKYCForm] = useState(false);
  const [showLimitRequest, setShowLimitRequest] = useState(false);
  const [requestedTier, setRequestedTier] = useState<LimitTier>('tier2');

  const kycFormId = useId();
  const limitRequestId = useId();
  const documentTypeId = `${kycFormId}-document-type`;
  const documentIdId = `${kycFormId}-document-id`;
  const requestedTierId = `${limitRequestId}-tier`;
  const kycHeadingId = `${kycFormId}-heading`;
  const limitsHeadingId = `${limitRequestId}-heading`;

  const documentTypeRef = useRef<HTMLSelectElement>(null);
  const documentIdRef = useRef<HTMLInputElement>(null);
  const requestedTierRef = useRef<HTMLSelectElement>(null);
  const startKYCButtonRef = useRef<HTMLButtonElement>(null);
  const requestLimitButtonRef = useRef<HTMLButtonElement>(null);

  const {
    values: formData,
    setFieldValue,
    handleSubmit: submitKYCForm,
    resetForm,
  } = useForm({
    initialValues: {
      documentType: 'passport',
      documentId: '',
    },
    schema: kycFormSchema,
    onSubmit: (data) => {
      KYCLimitService.submitKYC(userId, data.documentType, data.documentId);
      setKycStatus('pending');
      setShowKYCForm(false);
      resetForm();
    },
  });

  useEffect(() => {
    const kyc = KYCLimitService.getKYC(userId);
    if (kyc) setKycStatus(kyc.status);

    const userLimits = KYCLimitService.getUserLimits(userId);
    if (!userLimits) {
      KYCLimitService.initializeUserLimits(userId);
    }
    setLimits(KYCLimitService.getUserLimits(userId));
  }, [userId]);

  // Move focus into the KYC form when it opens, and back to the trigger when it closes.
  useEffect(() => {
    if (showKYCForm) {
      documentTypeRef.current?.focus();
    } else {
      startKYCButtonRef.current?.focus();
    }
  }, [showKYCForm]);

  // Move focus into the limit request form when it opens, and back to the trigger when it closes.
  useEffect(() => {
    if (showLimitRequest) {
      requestedTierRef.current?.focus();
    } else {
      requestLimitButtonRef.current?.focus();
    }
  }, [showLimitRequest]);

  const handleSubmitKYC = () => {
    if (!formData.documentId) return;
    submitKYCForm();
  };

  const handleRequestLimitIncrease = () => {
    KYCLimitService.requestLimitIncrease(userId, requestedTier);
    setShowLimitRequest(false);
    setLimits(KYCLimitService.getUserLimits(userId));
  };

  const tierLimits: Record<LimitTier, { daily: number; monthly: number }> = {
    tier1: { daily: 1000, monthly: 10000 },
    tier2: { daily: 5000, monthly: 50000 },
    tier3: { daily: 50000, monthly: 500000 },
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 id={kycHeadingId} className="text-lg font-semibold mb-4">
          KYC Verification
        </h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Status: <span className="font-medium capitalize">{kycStatus}</span>
          </p>
        </div>

        {kycStatus === 'unverified' && !showKYCForm && (
          <Button ref={startKYCButtonRef} onClick={() => setShowKYCForm(true)}>
            Start KYC
          </Button>
        )}

        {showKYCForm && (
          <form
            className="space-y-2"
            aria-labelledby={kycHeadingId}
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitKYC();
            }}
          >
            <label htmlFor={documentTypeId} className="block text-sm font-medium">
              Document Type
            </label>
            <select
              id={documentTypeId}
              ref={documentTypeRef}
              value={formData.documentType}
              onChange={(e) => setFieldValue('documentType', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="passport">Passport</option>
              <option value="license">Driver License</option>
              <option value="id">National ID</option>
            </select>
            <label htmlFor={documentIdId} className="block text-sm font-medium">
              Document ID
            </label>
            <input
              id={documentIdId}
              ref={documentIdRef}
              type="text"
              placeholder="Document ID"
              value={formData.documentId}
              onChange={(e) => setFieldValue('documentId', e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex gap-2">
              <Button type="submit">Submit</Button>
              <Button type="button" onClick={() => setShowKYCForm(false)} variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      {limits && (
        <Card className="p-4">
          <h3 id={limitsHeadingId} className="text-lg font-semibold mb-4">
            Transaction Limits
          </h3>
          <dl className="space-y-2 mb-4" aria-labelledby={limitsHeadingId}>
            <div className="flex justify-between">
              <dt>Current Tier:</dt>
              <dd className="font-medium capitalize">{limits.tier}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Daily Limit:</dt>
              <dd className="font-medium">${tierLimits[limits.tier].daily}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Monthly Limit:</dt>
              <dd className="font-medium">${tierLimits[limits.tier].monthly}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Daily Used:</dt>
              <dd className="font-medium">${limits.dailyUsed}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Monthly Used:</dt>
              <dd className="font-medium">${limits.monthlyUsed}</dd>
            </div>
          </dl>

          {!showLimitRequest && limits.tier !== 'tier3' && (
            <Button ref={requestLimitButtonRef} onClick={() => setShowLimitRequest(true)}>
              Request Limit Increase
            </Button>
          )}

          {showLimitRequest && (
            <form
              className="space-y-2"
              aria-labelledby={limitsHeadingId}
              onSubmit={(e) => {
                e.preventDefault();
                handleRequestLimitIncrease();
              }}
            >
              <label htmlFor={requestedTierId} className="block text-sm font-medium">
                Requested Tier
              </label>
              <select
                id={requestedTierId}
                ref={requestedTierRef}
                value={requestedTier}
                onChange={(e) => setRequestedTier(e.target.value as LimitTier)}
                className="w-full p-2 border rounded"
              >
                {limits.tier === 'tier1' && <option value="tier2">Tier 2</option>}
                {limits.tier === 'tier1' && <option value="tier3">Tier 3</option>}
                {limits.tier === 'tier2' && <option value="tier3">Tier 3</option>}
              </select>
              <div className="flex gap-2">
                <Button type="submit">Request</Button>
                <Button type="button" onClick={() => setShowLimitRequest(false)} variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {limits.limitIncreaseRequests.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Pending Requests:</p>
              <ul aria-label="Pending limit increase requests">
                {limits.limitIncreaseRequests.map((req: LimitIncreaseRequest) => (
                  <li key={req.id} className="text-sm p-2 bg-gray-100 rounded">
                    {req.requestedTier} - <span className="capitalize">{req.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
