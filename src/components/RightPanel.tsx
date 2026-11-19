'use client';

import { memo, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { QuoteDisplaySkeleton } from './skeletons';
import { useFxRate } from '@/hooks/useFxRate';
import { CollapsibleSection } from './CollapsibleSection';
import {
  type RightPanelProps,
  formatFiat,
  formatNetworkFee,
} from './right-panel/types';
import { HeroPanel } from './right-panel/HeroPanel';
import { BreakdownRow } from './right-panel/BreakdownRow';

export * from './right-panel/types';

function RightPanel(props: RightPanelProps) {
  const { quote, isConnected, isLoadingQuote, currency } = props;
  const { rate: liveRate, flash } = useFxRate();

  const amountValue = useMemo(() => parseFloat(props.amount), [props.amount]);

  const platformFeeUsdc = useMemo(
    () =>
      quote && amountValue > 0
        ? `${(amountValue * 0.0035).toFixed(4)} USDC`
        : '0.35%',
    [quote, amountValue],
  );

  const effectiveRate = liveRate ?? quote?.rate ?? null;

  const liveDestination = useMemo(
    () =>
      effectiveRate && props.amount && amountValue > 0
        ? (amountValue * effectiveRate).toFixed(2)
        : null,
    [effectiveRate, props.amount, amountValue],
  );

  const payoutTotal = useMemo(
    () =>
      isConnected && (liveDestination || quote) && amountValue > 0
        ? formatFiat(liveDestination ?? quote!.destinationAmount, currency || quote!.currency)
        : isLoadingQuote
          ? '...'
          : `— ${currency.toUpperCase()}`,
    [isConnected, liveDestination, quote, amountValue, currency, isLoadingQuote],
  );

  if (isLoadingQuote && !quote) {
    return <QuoteDisplaySkeleton />;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <HeroPanel {...props} liveRate={liveRate} flash={flash} />

      <div className="border border-[#333333] bg-[#111111] p-5 flex flex-col gap-3">
        <span className="text-[10px] tracking-[0.2em] text-[#777777] uppercase mb-1">
          SETTLEMENT BREAKDOWN
        </span>

        <BreakdownRow label="Network Fee" value={formatNetworkFee(quote)} muted={!quote} />
        <BreakdownRow label="Platform Fee" value={platformFeeUsdc} muted={!quote} />

        <div className="border-t border-[#333333] my-1" />

        <div className="flex items-end justify-between gap-4">
          <span className="text-xs tracking-widest text-[#777777] uppercase">Payout Total</span>
          <span
            className={cn(
              'font-space-grotesk font-bold tabular-nums leading-none transition-colors duration-300 text-[clamp(1.1rem,2.5vw,1.5rem)]',
              isLoadingQuote ? 'text-[#777777]' : flash ? 'text-white' : 'text-[#c9a962]',
            )}
          >
            {payoutTotal}
          </span>
        </div>
      </div>

      <CollapsibleSection
        id="advanced-options"
        title="Advanced Options"
        description="Additional settings for power users"
        defaultOpen={false}
      >
        <div className="flex flex-col gap-3">
          <BreakdownRow label="Bridge Protocol" value="Allbridge" muted />
          <BreakdownRow label="Settlement Chain" value="Base" muted />
          <BreakdownRow label="Payout Provider" value="Paycrest" muted />
        </div>
      </CollapsibleSection>
    </div>
  );
}

export default memo(RightPanel);
