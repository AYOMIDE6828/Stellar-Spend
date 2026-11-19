'use client';

import { logger } from '@/lib/logger';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { Transaction } from '@/lib/transaction-storage';
import { exportCSV, exportPDF, exportJSON, exportXLSX, filterByDateRange } from '@/lib/export';
import { useTranslation } from '@/lib/i18n';

const WALLET_SLUG_PREFIX_LENGTH = 6;
const WALLET_SLUG_SUFFIX_LENGTH = 4;
const DEFAULT_WALLET_SLUG = 'wallet';
const EXPORT_BASENAME_PREFIX = 'stellar_spend';
const DATE_RANGE_START_FALLBACK = 'start';
const DATE_RANGE_END_FALLBACK = 'end';

type ExportFormat = 'csv' | 'pdf' | 'json' | 'xlsx';

interface Props {
  transactions: Transaction[];
  walletAddress?: string;
}

export default function ExportControls({ transactions, walletAddress }: Props) {
  const { t } = useTranslation();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const filtered = filterByDateRange(transactions, dateFrom, dateTo);
  const disabled = filtered.length === 0;

  const slug = walletAddress
    ? `${walletAddress.slice(0, WALLET_SLUG_PREFIX_LENGTH)}_${walletAddress.slice(-WALLET_SLUG_SUFFIX_LENGTH)}`
    : DEFAULT_WALLET_SLUG;
  const dateTag =
    dateFrom || dateTo
      ? `_${dateFrom || DATE_RANGE_START_FALLBACK}_to_${dateTo || DATE_RANGE_END_FALLBACK}`
      : '';
  const basename = `${EXPORT_BASENAME_PREFIX}_${slug}${dateTag}`;

  const inputCls = cn(
    'bg-[#0a0a0a] border border-[#333333] px-3 py-2 text-xs text-white',
    'focus:outline-none focus:border-[#c9a962] [color-scheme:dark]',
  );

  const handleExport = async (format: ExportFormat) => {
    try {
      setExporting(format);
      switch (format) {
        case 'csv':
          exportCSV(filtered, `${basename}.csv`);
          break;
        case 'pdf':
          exportPDF(filtered, basename);
          break;
        case 'json':
          exportJSON(filtered, `${basename}.json`);
          break;
        case 'xlsx':
          await exportXLSX(filtered, `${basename}.xlsx`);
          break;
      }
    } catch (error) {
      logger.error(`Export failed for ${format}:`, {}, error);
    } finally {
      setExporting(null);
    }
  };

  const buttonCls = (format: ExportFormat) =>
    cn(
      'text-[10px] tracking-widest uppercase px-4 py-2 border transition-colors duration-150',
      'border-[#c9a962] text-[#c9a962]',
      !disabled && 'hover:bg-[#c9a962] hover:text-[#0a0a0a]',
      disabled && 'opacity-40 cursor-not-allowed',
      exporting === format && 'opacity-60',
    );

  return (
    <div className="border border-[#333333] bg-[#111111] p-4 flex flex-wrap items-center gap-3">
      {/* Date range */}
      <div className="flex items-center gap-2">
        <label className="text-[10px] text-[#777777] uppercase tracking-widest whitespace-nowrap">
          {t('export.from')}
        </label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label={t('export.dateFromAria')}
          className={inputCls}
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[10px] text-[#777777] uppercase tracking-widest whitespace-nowrap">
          {t('export.to')}
        </label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label={t('export.dateToAria')}
          className={inputCls}
        />
      </div>

      <span className="text-[10px] text-[#555555] whitespace-nowrap">
        {t('export.transactionCount', {
          filtered: filtered.length,
          total: transactions.length,
        })}
      </span>

      {/* CSV */}
      <button
        onClick={() => handleExport('csv')}
        disabled={disabled || exporting !== null}
        aria-label={t('export.csvAria')}
        data-testid="export-button"
        className={buttonCls('csv')}
      >
        {exporting === 'csv' ? t('export.csvLoading') : t('export.csv')}
      </button>

      {/* JSON */}
      <button
        onClick={() => handleExport('json')}
        disabled={disabled || exporting !== null}
        aria-label={t('export.jsonAria')}
        className={buttonCls('json')}
      >
        {exporting === 'json' ? t('export.jsonLoading') : t('export.json')}
      </button>

      {/* XLSX */}
      <button
        onClick={() => handleExport('xlsx')}
        disabled={disabled || exporting !== null}
        aria-label={t('export.xlsxAria')}
        className={buttonCls('xlsx')}
      >
        {exporting === 'xlsx' ? t('export.xlsxLoading') : t('export.xlsx')}
      </button>

      {/* PDF */}
      <button
        onClick={() => handleExport('pdf')}
        disabled={disabled || exporting !== null}
        aria-label={t('export.pdfAria')}
        className={cn(
          'text-[10px] tracking-widest uppercase px-4 py-2 border transition-colors duration-150',
          'border-[#777777] text-[#777777]',
          !disabled && 'hover:border-[#c9a962] hover:text-[#c9a962]',
          disabled && 'opacity-40 cursor-not-allowed',
          exporting === 'pdf' && 'opacity-60',
        )}
      >
        {exporting === 'pdf' ? t('export.pdfLoading') : t('export.pdf')}
      </button>
    </div>
  );
}
