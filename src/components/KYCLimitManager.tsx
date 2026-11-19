'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { KYCLimitService, KYCStatus, LimitTier, UserLimits, LimitIncreaseRequest } from '@/lib/kyc-limits';
import { Button, Card } from '@/components/design-system';
import { useForm } from '@/hooks/useForm';
import { useTranslations } from '@/hooks/useTranslations';

interface KYCLimitManagerProps {
  userId: string;
}

const TIER_LIMITS: Record<LimitTier, { daily: number; monthly: number }> = {
  tier1: { daily: 1000, monthly: 10000 },
  tier2: { daily: 5000, monthly: 50000 },
  tier3: { daily: 50000, monthly: 500000 },
};

const DEFAULT_DOCUMENT_TYPE = 'passport';
const HIGHEST_TIER: LimitTier = 'tier3';
const DEFAULT_REQUESTED_TIER: LimitTier = 'tier2';

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'passport', labelKey: 'kyc.documentTypes.passport' },
  { value: 'license', labelKey: 'kyc.documentTypes.license' },
  { value: 'id', labelKey: 'kyc.documentTypes.id' },
] as const;

const kycFormSchema = z.object({
  documentType: z.string().min(1),
  documentId: z.string().min(1, 'Document ID is required'),
});

export function KYCLimitManager({ userId }: KYCLimitManagerProps) {
  const { t } = useTranslations();
  const [kycStatus, setKycStatus] = useState<KYCStatus>('unverified');
  const [limits, setLimits] = useState<UserLimits | null>(null);
  const [showKYCForm, setShowKYCForm] = useState(false);
  const [showLimitRequest, setShowLimitRequest] = useState(false);
  const [requestedTier, setRequestedTier] = useState<LimitTier>(DEFAULT_REQUESTED_TIER);

  const {
    values: formData,
    setFieldValue,
    handleSubmit: submitKYCForm,
    resetForm,
  } = useForm({
    initialValues: {
      documentType: DEFAULT_DOCUMENT_TYPE,
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

  const handleSubmitKYC = () => {
    if (!formData.documentId) return;
    submitKYCForm();
  };

  const handleRequestLimitIncrease = () => {
    KYCLimitService.requestLimitIncrease(userId, requestedTier);
    setShowLimitRequest(false);
    setLimits(KYCLimitService.getUserLimits(userId));
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">{t('kyc.title')}</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {t('kyc.statusLabel')}{' '}
            <span className="font-medium capitalize">{t(`kyc.status.${kycStatus}`)}</span>
          </p>
        </div>

        {kycStatus === 'unverified' && !showKYCForm && (
          <Button onClick={() => setShowKYCForm(true)}>{t('kyc.startKyc')}</Button>
        )}

        {showKYCForm && (
          <div className="space-y-2">
            <select
              value={formData.documentType}
              onChange={(e) => setFieldValue('documentType', e.target.value)}
              className="w-full p-2 border rounded"
            >
              {DOCUMENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder={t('kyc.documentIdPlaceholder')}
              value={formData.documentId}
              onChange={(e) => setFieldValue('documentId', e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmitKYC}>{t('common.submit')}</Button>
              <Button onClick={() => setShowKYCForm(false)} variant="secondary">
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {limits && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">{t('limits.title')}</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>{t('limits.currentTier')}</span>
              <span className="font-medium capitalize">{t(`limits.tiers.${limits.tier}`)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('limits.dailyLimit')}</span>
              <span className="font-medium">${TIER_LIMITS[limits.tier].daily}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('limits.monthlyLimit')}</span>
              <span className="font-medium">${TIER_LIMITS[limits.tier].monthly}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('limits.dailyUsed')}</span>
              <span className="font-medium">${limits.dailyUsed}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('limits.monthlyUsed')}</span>
              <span className="font-medium">${limits.monthlyUsed}</span>
            </div>
          </div>

          {!showLimitRequest && limits.tier !== HIGHEST_TIER && (
            <Button onClick={() => setShowLimitRequest(true)}>
              {t('limits.requestIncrease')}
            </Button>
          )}

          {showLimitRequest && (
            <div className="space-y-2">
              <select
                value={requestedTier}
                onChange={(e) => setRequestedTier(e.target.value as LimitTier)}
                className="w-full p-2 border rounded"
              >
                {limits.tier === 'tier1' && (
                  <option value="tier2">{t('limits.tiers.tier2')}</option>
                )}
                {limits.tier === 'tier1' && (
                  <option value="tier3">{t('limits.tiers.tier3')}</option>
                )}
                {limits.tier === 'tier2' && (
                  <option value="tier3">{t('limits.tiers.tier3')}</option>
                )}
              </select>
              <div className="flex gap-2">
                <Button onClick={handleRequestLimitIncrease}>{t('limits.request')}</Button>
                <Button onClick={() => setShowLimitRequest(false)} variant="secondary">
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}

          {limits.limitIncreaseRequests.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">{t('limits.pendingRequests')}</p>
              {limits.limitIncreaseRequests.map((req: LimitIncreaseRequest) => (
                <div key={req.id} className="text-sm p-2 bg-gray-100 rounded">
                  {t(`limits.tiers.${req.requestedTier}`)} -{' '}
                  <span className="capitalize">{t(`limits.requestStatus.${req.status}`)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
