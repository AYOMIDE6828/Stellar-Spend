'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

export interface ProviderQuote {
  id: string;
  provider: string;
  rate: number;
  bridgeFee: string;
  payoutFee: string;
  totalFee: string;
  estimatedTime: number; // seconds
  destinationAmount: string;
  currency: string;
  rating: number; // 1-5
  badge?: 'Best Rate' | 'Fastest' | 'Lowest Fee';
}

interface QuoteComparisonProps {
  quotes: ProviderQuote[];
  selectedId?: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span
      className="inline-flex gap-0.5"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          aria-hidden="true"
          className={cn('text-[10px]', s <= rating ? 'text-accent' : 'text-line')}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `~${seconds}s`;
  const mins = Math.round(seconds / 60);
  return `~${mins}m`;
}

function QuoteComparison({ quotes, selectedId, onSelect, isLoading }: QuoteComparisonProps) {
  const [sortBy, setSortBy] = useState<'rate' | 'fee' | 'time'>('rate');

  const sorted = [...quotes].sort((a, b) => {
    if (sortBy === 'rate') return b.rate - a.rate;
    if (sortBy === 'fee') return parseFloat(a.totalFee) - parseFloat(b.totalFee);
    return a.estimatedTime - b.estimatedTime;
  });

  if (isLoading) {
    return (
      <div className="py-4" role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">Loading quotes…</span>
        {[0, 1, 2].map((i) => (
          <div key={i} aria-hidden="true" className="skeleton h-[72px] mb-2 rounded" />
        ))}
      </div>
    );
  }

  if (!quotes.length) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Sort controls */}
      <div
        className="flex gap-1.5 items-center"
        role="group"
        aria-label="Sort quotes by"
      >
        <span className="text-[11px] text-muted" aria-hidden="true">
          Sort by:
        </span>
        {(['rate', 'fee', 'time'] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setSortBy(opt)}
            aria-pressed={sortBy === opt}
            className={cn(
              'text-[11px] px-2 py-[3px] border bg-transparent cursor-pointer capitalize',
              sortBy === opt ? 'border-accent text-accent' : 'border-line text-muted',
            )}
          >
            {opt === 'rate' ? 'Best Rate' : opt === 'fee' ? 'Lowest Fee' : 'Fastest'}
          </button>
        ))}
      </div>

      {/* Table header */}
      <div
        aria-hidden="true"
        className="grid grid-cols-[1fr_80px_80px_70px_60px_32px] gap-2 px-3 py-1.5 text-[10px] text-muted tracking-[0.06em] uppercase border-b border-line"
      >
        <span>Provider</span>
        <span>You Receive</span>
        <span>Total Fee</span>
        <span>Est. Time</span>
        <span>Rating</span>
        <span />
      </div>

      {/* Rows */}
      <div role="radiogroup" aria-label="Select a provider quote">
        {sorted.map((q) => {
          const isSelected = q.id === selectedId;
          return (
            <button
              key={q.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${q.provider}, you receive ${formatNumber(
                parseFloat(q.destinationAmount),
              )} ${q.currency}, total fee ${q.totalFee} USDC, estimated time ${formatTime(
                q.estimatedTime,
              )}, rated ${q.rating} out of 5${q.badge ? `, ${q.badge}` : ''}`}
              onClick={() => onSelect(q.id)}
              className={cn(
                'grid grid-cols-[1fr_80px_80px_70px_60px_32px] gap-2 px-3 py-2.5 border cursor-pointer text-left items-center transition-[border-color,background-color] duration-150 w-full mb-2',
                isSelected
                  ? 'border-accent bg-[color-mix(in_srgb,var(--accent)_8%,var(--panel))]'
                  : 'border-line bg-panel',
              )}
            >
              {/* Provider name + badge */}
              <div className="flex flex-col gap-[3px]">
                <span className="text-[13px] text-text font-medium">{q.provider}</span>
                {q.badge && (
                  <span className="text-[9px] px-[5px] py-px bg-accent text-black rounded-[2px] w-fit tracking-[0.05em] uppercase">
                    {q.badge}
                  </span>
                )}
              </div>

              {/* Destination amount */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-text">
                  {formatNumber(parseFloat(q.destinationAmount))}
                </span>
                <span className="text-[10px] text-muted">{q.currency}</span>
              </div>

              {/* Fees breakdown */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-text">{q.totalFee} USDC</span>
                <span className="text-[10px] text-muted">
                  Bridge: {q.bridgeFee} · Payout: {q.payoutFee}
                </span>
              </div>

              {/* Estimated time */}
              <span className="text-[13px] text-text">{formatTime(q.estimatedTime)}</span>

              {/* Rating */}
              <StarRating rating={q.rating} />

              {/* Selection indicator */}
              <div
                aria-hidden="true"
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                  isSelected ? 'border-accent bg-accent' : 'border-line bg-transparent',
                )}
              >
                {isSelected && <span className="text-[8px] text-black leading-none">✓</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
