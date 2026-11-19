'use client';

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

// New feature module files (create these under src/features/dashboard/):

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

  return {
    currentQuote,
    currentAmount,
    currentCurrency,
    handleSubmit,
    handleQuoteChange: setCurrentQuote,
    handleAmountChange: setCurrentAmount,
    handleCurrencyChange: setCurrentCurrency,
  };
}

// src/features/dashboard/DashboardHeaderSection.tsx
'use client';

import Header from '@/components/Header';

export interface DashboardHeaderSectionProps {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function DashboardHeaderSection({
  isConnected,
  isConnecting,
  walletAddress,
  onConnect,
  onDisconnect,
}: DashboardHeaderSectionProps) {
  return (
    <Header
      subtitle="Off-Ramp USDC/USDT to Fiat"
      isConnected={isConnected}
      isConnecting={isConnecting}
      walletAddress={walletAddress}
      stellarUsdcBalance={isConnected ? '1,234.56' : null}
      stellarXlmBalance={isConnected ? '567.89' : null}
      isBalanceLoading={false}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
    />
  );
}

// src/features/dashboard/OfframpFormSection.tsx
'use client';

import { FormCard, type OfframpPayload, type QuoteResult } from '@/components/FormCard';

export interface OfframpFormSectionProps {
  isConnected: boolean;
  isConnecting: boolean;
  resetKey: number;
  onConnect: () => void;
  onSubmit: (payload: OfframpPayload) => Promise<void>;
  onQuoteChange: (quote: QuoteResult | null) => void;
  onAmountChange: (amount: string) => void;
  onCurrencyChange: (currency: string) => void;
}

export function OfframpFormSection(props: OfframpFormSectionProps) {
  return <FormCard {...props} />;
}

// src/features/dashboard/RightPanelSection.tsx
'use client';

import RightPanel from '@/components/RightPanel';
import type { QuoteResult } from '@/components/FormCard';

export interface RightPanelSectionProps {
  quote: QuoteResult | null;
  amount: string;
  currency: string;
}

export function RightPanelSection({ quote, amount, currency }: RightPanelSectionProps) {
  return <RightPanel quote={quote} amount={amount} currency={currency} />;
}

// src/features/dashboard/index.ts
export { useDashboardState } from './useDashboardState';
export type { DashboardState } from './useDashboardState';
export { DashboardHeaderSection } from './DashboardHeaderSection';
export type { DashboardHeaderSectionProps } from './DashboardHeaderSection';
export { OfframpFormSection } from './OfframpFormSection';
export type { OfframpFormSectionProps } from './OfframpFormSection';
export { RightPanelSection } from './RightPanelSection';
export type { RightPanelSectionProps } from './RightPanelSection';

// Unit tests to add:
// - src/features/dashboard/__tests__/useDashboardState.test.ts(x)
// - src/features/dashboard/__tests__/DashboardHeaderSection.test.tsx
// - src/features/dashboard/__tests__/OfframpFormSection.test.tsx
// - src/features/dashboard/__tests__/RightPanelSection.test.tsx

export default function DashboardClient() {
  // Track Web Vitals
  useWebVitals();

  const { isConnected, isConnecting, walletAddress, resetKey, handleConnect, handleDisconnect } =
    useDashboardWallet();

  const {
    currentQuote,
    currentAmount,
    currentCurrency,
    handleSubmit,
    handleQuoteChange,
    handleAmountChange,
    handleCurrencyChange,
  } = useDashboardState();

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
        <RightPanelSection
          quote={currentQuote}
          amount={currentAmount}
          currency={currentCurrency}
        />
      </section>
    </>
  );
}
