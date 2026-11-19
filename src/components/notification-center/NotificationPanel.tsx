'use client';

import { forwardRef, useEffect, useId, useRef } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/Icon';
import { AsyncBoundary, ListEmptyState, ListLoadingState } from '@/components/AsyncBoundary';
import type { NotificationCenterEvent } from '@/hooks/useNotificationCenter';
import { NotificationItem } from './NotificationItem';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface NotificationPanelProps {
  events: NotificationCenterEvent[];
  loading: boolean;
  onNotificationClick: (event: NotificationCenterEvent) => void;
  onMarkAllAsRead: () => void;
  onRemoveEvent: (eventId: string) => void;
  onClearAll: () => void;
  /** Called when the user presses Escape or requests the panel to close. */
  onClose?: () => void;
}

export const NotificationPanel = forwardRef<HTMLDivElement, NotificationPanelProps>(
  function NotificationPanel(
    {
      events,
      loading,
      onNotificationClick,
      onMarkAllAsRead,
      onRemoveEvent,
      onClearAll,
      onClose,
    },
    ref,
  ) {
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement | null>(null);

    const setRefs = (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Focus management: move focus into the panel on mount and restore it on unmount.
    useEffect(() => {
      const previouslyFocused = document.activeElement as HTMLElement | null;
      const panel = panelRef.current;
      if (panel) {
        const firstFocusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (firstFocusable ?? panel).focus();
      }
      return () => {
        if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
          previouslyFocused.focus();
        }
      };
    }, []);

    // Keyboard handling: Escape closes, Tab is trapped within the panel.
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || active === panel) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    return (
      <div
        ref={setRefs}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          'absolute right-0 top-full mt-2 w-80 max-h-96',
          'bg-[#111111] border border-[#333333] rounded shadow-xl',
          'z-50 flex flex-col overflow-hidden',
          'focus:outline-none',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#333333]">
          <h3
            id={titleId}
            className="text-sm font-semibold text-white tracking-wide"
          >
            NOTIFICATIONS
          </h3>
          {events.length > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              aria-label="Mark all notifications as read"
              className={cn(
                'text-[10px] text-[#c9a962] hover:text-[#dbb76d]',
                'transition-colors focus:outline-none focus-visible:underline',
                'focus-visible:ring-1 focus-visible:ring-[#c9a962] rounded',
              )}
              title="Mark all as read"
            >
              Mark Read
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AsyncBoundary
            isLoading={loading}
            isEmpty={events.length === 0}
            loadingContent={<ListLoadingState rows={3} />}
            emptyContent={
              <ListEmptyState
                title="No notifications yet"
                description="Stay tuned for updates on your transactions"
                icon={
                  <Icon name="bell" size={32} strokeWidth={1.5} />
                }
              />
            }
          >
            <ul className="divide-y divide-[#222222]">
              {events.map((event) => (
                <NotificationItem
                  key={event.id}
                  event={event}
                  onClick={onNotificationClick}
                  onRemove={onRemoveEvent}
                />
              ))}
            </ul>
          </AsyncBoundary>
        </div>

        {/* Footer */}
        {events.length > 0 && (
          <div className="px-4 py-2 border-t border-[#333333] bg-[#0a0a0a]">
            <button
              type="button"
              onClick={onClearAll}
              aria-label="Clear all notifications"
              className={cn(
                'w-full text-[10px] text-[#777777] hover:text-red-400',
                'transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a962]',
                'py-1 rounded tracking-widest uppercase',
              )}
              title="Clear all notifications"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    );
  },
);
