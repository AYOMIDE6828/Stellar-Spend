'use client';

import { logger } from '@/lib/logger';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback rendered when an error is caught. */
  fallback?: ReactNode;
  /** Called when an error is caught, before the fallback is rendered. */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** When true, renders `loadingContent` instead of children. */
  isLoading?: boolean;
  /** When true (and not loading/erroring), renders `emptyContent`. */
  isEmpty?: boolean;
  /** Externally supplied error (e.g. from a data fetch). */
  error?: Error | null;
  /** Content rendered while `isLoading` is true. */
  loadingContent?: ReactNode;
  /** Content rendered while `isEmpty` is true. */
  emptyContent?: ReactNode;
  /** Content rendered when `error` is set or an error is caught. */
  errorContent?: ReactNode;
  /** Optional className applied to the default state containers. */
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

const DEFAULT_CONTAINER_CLASS =
  'flex flex-col items-center justify-center min-h-[200px] p-8 text-center gap-4';

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
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

  private renderError(error: Error | null) {
    if (this.props.errorContent) return this.props.errorContent;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        className={`${DEFAULT_CONTAINER_CLASS} border border-red-500/30 bg-red-500/5 ${this.props.className ?? ''}`.trim()}
      >
        <p className="text-red-400 font-medium">Something went wrong</p>
        <p className="text-[#888] text-sm max-w-sm">
          {error?.message ?? 'An unexpected error occurred.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={this.handleReset}
            className="px-4 py-2 text-sm border border-[#333] text-[#ccc] hover:border-[#555] transition-colors"
          >
            Try again
          </button>
          {this.state.eventId && (
            <button
              onClick={this.handleReport}
              className="px-4 py-2 text-sm border border-[#333] text-[#888] hover:border-[#555] transition-colors"
            >
              Report issue
            </button>
          )}
        </div>
      </div>
    );
  }

  render() {
    const { isLoading, isEmpty, error, loadingContent, emptyContent } = this.props;

    if (this.state.hasError) {
      return this.renderError(this.state.error);
    }

    if (error) {
      return this.renderError(error);
    }

    if (isLoading) {
      return (
        loadingContent ?? (
          <div
            role="status"
            aria-live="polite"
            className={`${DEFAULT_CONTAINER_CLASS} ${this.props.className ?? ''}`.trim()}
          >
            <p className="text-[#888] text-sm">Loading…</p>
          </div>
        )
      );
    }

    if (isEmpty) {
      return (
        emptyContent ?? (
          <div
            role="status"
            className={`${DEFAULT_CONTAINER_CLASS} ${this.props.className ?? ''}`.trim()}
          >
            <p className="text-[#888] text-sm">Nothing to show</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
