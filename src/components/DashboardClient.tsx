'use client';

import { useState, useCallback, memo } from 'react';
import { useDashboardWallet } from '@/hooks/useDashboardWallet';
import { useWebVitals } from '@/hooks/useWebVitals';
import {
  DashboardHeaderSection,
  OfframpFormSection,
  RightPanelSection,
  useDashboardState,
} from '@/features/dashboard';

/**
 * DashboardClient - Client Component
 * Thin composition shell that wires wallet state and dashboard feature modules.
 * Separated to allow server-rendered static content in main page
 */

function DashboardClient() {
  // Track Web Vitals
  useWebVitals();

// src/features/dashboard/useDashboardState.ts
'use client';

import { useState, useCallback } from 'react';
import type { OfframpPayload, QuoteResult } from '@/components/FormCard';

export interface DashboardState {
  currentQuote: QuoteResult | null;
  currentAmount: string;
  currentCurrency: string;
  handleSubmit: (payload: OfframpPayload) => Promise<void>;
  handleQuoteChange: (quote: QuoteResult | null) => void;
  handleAmountChange: (amount: string) => void;
  handleCurrencyChange: (currency: string) => void;
}

export function useDashboardState(): DashboardState {
  const [currentQuote, setCurrentQuote] = useState<QuoteResult | null>(null);
  const [currentAmount, setCurrentAmount] = useState('');
  const [currentCurrency, setCurrentCurrency] = useState('');

  const handleSubmit = useCallback(async (_payload: OfframpPayload) => {
    // Implement actual submission logic
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert('Offramp initiated successfully!');
  }, []);

  const handleQuoteChange = useCallback((quote: QuoteResult | null) => {
    setCurrentQuote(quote);
  }, []);

  const handleAmountChange = useCallback((amount: string) => {
    setCurrentAmount(amount);
  }, []);

  const handleCurrencyChange = useCallback((currency: string) => {
    setCurrentCurrency(currency);
  }, []);

  return (
    <>
      <DashboardHeaderSection
        isConnected={isConnected}
        isConnecting={isConnecting}
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]">
        <OfframpFormSection
          isConnected={isConnected}
          isConnecting={isConnecting}
          resetKey={resetKey}
          onConnect={handleConnect}
          onSubmit={handleSubmit}
          onQuoteChange={handleQuoteChange}
          onAmountChange={handleAmountChange}
          onCurrencyChange={handleCurrencyChange}
        />
      </section>
    </>
  );
}

export default memo(DashboardClient);
