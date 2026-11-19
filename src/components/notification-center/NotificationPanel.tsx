'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/Icon';
import { AsyncBoundary, ListEmptyState, ListLoadingState } from '@/components/AsyncBoundary';
import type { NotificationCenterEvent } from '@/hooks/useNotificationCenter';
import { useNotificationCenterContext } from './NotificationCenterContext';
import { NotificationItem } from './NotificationItem';

export interface NotificationPanelProps {
  /** @deprecated Prefer the shared NotificationCenterContext; kept for backwards compatibility. */
  events?: NotificationCenterEvent[];
  /** @deprecated Prefer the shared NotificationCenterContext; kept for backwards compatibility. */
  loading?: boolean;
  /** @deprecated Prefer the shared NotificationCenterContext; kept for backwards compatibility. */
  onNotificationClick?: (event: NotificationCenterEvent) => void;
  /** @deprecated Prefer the shared NotificationCenterContext; kept for backwards compatibility. */
  onMarkAllAsRead?: () => void;
  /** @deprecated Prefer the shared NotificationCenterContext; kept for backwards compatibility. */
  onRemoveEvent?: (eventId: string) => void;
  /** @deprecated Prefer the shared NotificationCenterContext; kept for backwards compatibility. */
  onClearAll?: () => void;
}

export const NotificationPanel = forwardRef<HTMLDivElement, NotificationPanelProps>(
  function NotificationPanel(props, ref) {
    const context = useNotificationCenterContext();

    // Props take precedence when explicitly provided so existing callers keep working.
    const events = props.events ?? context.events;
    const loading = props.loading ?? context.loading;
    const onNotificationClick = props.onNotificationClick ?? context.onNotificationClick;
    const onMarkAllAsRead = props.onMarkAllAsRead ?? context.onMarkAllAsRead;
    const onRemoveEvent = props.onRemoveEvent ?? context.onRemoveEvent;
    const onClearAll = props.onClearAll ?? context.onClearAll;

    return (
      <div
        ref={ref}
        role="dialog"
        aria-label="Notifications"
        className={cn(
          'absolute right-0 top-full mt-2 w-80 max-h-96',
          'bg-[#111111] border border-[#333333] rounded shadow-xl',
          'z-50 flex flex-col overflow-hidden',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#333333]">
          <h3 className="text-sm font-semibold text-white tracking-wide">NOTIFICATIONS</h3>
          {events.length > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className={cn(
                'text-[10px] text-[#c9a962] hover:text-[#dbb76d]',
                'transition-colors focus:outline-none focus-visible:underline',
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
              onClick={onClearAll}
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
