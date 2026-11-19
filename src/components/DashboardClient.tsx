'use client';

import { useState, useCallback } from 'react';
import { useDashboardWallet } from '@/hooks/useDashboardWallet';
import { useWebVitals } from '@/hooks/useWebVitals';
import { useTranslations } from '@/lib/i18n';
import Header from './Header';
import { FormCard, type OfframpPayload, type QuoteResult } from './FormCard';
import RightPanel from './RightPanel';

/** Simulated submission latency (ms) for the off-ramp flow. */
const SUBMIT_DELAY_MS = 2000;

/** Placeholder balances shown while connected (demo data). */
const DEMO_USDC_BALANCE = '1,234.56';
const DEMO_XLM_BALANCE = '567.89';

/**
 * DashboardClient - Client Component
 * Handles wallet state and interactive form logic
 * Separated to allow server-rendered static content in main page
 */

export default function DashboardClient() {
  // Track Web Vitals
  useWebVitals();

  const t = useTranslations('dashboard');

  const { isConnected, isConnecting, walletAddress, resetKey, handleConnect, handleDisconnect } =
    useDashboardWallet();

  // Shared state for FormCard <-> RightPanel sync
  const [currentQuote, setCurrentQuote] = useState<QuoteResult | null>(null);
  const [currentAmount, setCurrentAmount] = useState('');
  const [currentCurrency, setCurrentCurrency] = useState('');

  const handleSubmit = useCallback(
    async (_payload: OfframpPayload) => {
      // Implement actual submission logic
      await new Promise((resolve) => setTimeout(resolve, SUBMIT_DELAY_MS));
      alert(t('offrampSuccess'));
    },
    [t],
  );

  return (
    <>
      <Header
        subtitle={t('subtitle')}
        isConnected={isConnected}
        isConnecting={isConnecting}
        walletAddress={walletAddress}
        stellarUsdcBalance={isConnected ? DEMO_USDC_BALANCE : null}
        stellarXlmBalance={isConnected ? DEMO_XLM_BALANCE : null}
        isBalanceLoading={false}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]">
        <FormCard
          isConnected={isConnected}
          isConnecting={isConnecting}
          resetKey={resetKey}
          onConnect={handleConnect}
          onSubmit={handleSubmit}
          onQuoteChange={setCurrentQuote}
          onAmountChange={setCurrentAmount}
          onCurrencyChange={setCurrentCurrency}
        />
        <RightPanel quote={currentQuote} amount={currentAmount} currency={currentCurrency} />
      </section>
    </>
  );
}
