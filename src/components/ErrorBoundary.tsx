'use client';

import { logger } from '@/lib/logger';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { useTranslations } from 'next-intl';

const ERROR_BOUNDARY_NAMESPACE = 'ErrorBoundary';
const MIN_HEIGHT_PX = 200;
const FALLBACK_ERROR_MESSAGE_KEY = 'unexpectedError';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, eventId: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const eventId = Sentry.captureException(error, {
      extra: { componentStack: info.componentStack },
    });
    this.setState({ eventId: eventId ?? null });
    this.props.onError?.(error, info);
    logger.error('ErrorBoundary', { componentStack: info.componentStack }, error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, eventId: null });
  };

  handleReport = () => {
    if (this.state.eventId) {
      Sentry.showReportDialog({ eventId: this.state.eventId });
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <ErrorFallback
        error={this.state.error}
        eventId={this.state.eventId}
        onReset={this.handleReset}
        onReport={this.handleReport}
      />
    );
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  eventId: string | null;
  onReset: () => void;
  onReport: () => void;
}

function ErrorFallback({ error, eventId, onReset, onReport }: ErrorFallbackProps) {
  const t = useTranslations(ERROR_BOUNDARY_NAMESPACE);

  return (
    <div
      role="alert"
      style={{ minHeight: MIN_HEIGHT_PX }}
      className="flex flex-col items-center justify-center p-8 border border-red-500/30 bg-red-500/5 text-center gap-4"
    >
      <p className="text-red-400 font-medium">{t('title')}</p>
      <p className="text-[#888] text-sm max-w-sm">
        {error?.message ?? t(FALLBACK_ERROR_MESSAGE_KEY)}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm border border-[#333] text-[#ccc] hover:border-[#555] transition-colors"
        >
          {t('tryAgain')}
        </button>
        {eventId && (
          <button
            onClick={onReport}
            className="px-4 py-2 text-sm border border-[#333] text-[#888] hover:border-[#555] transition-colors"
          >
            {t('reportIssue')}
          </button>
        )}
      </div>
    </div>
  );
}
