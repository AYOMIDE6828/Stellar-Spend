'use client';

import { useEffect, useCallback } from 'react';
import { useClipboard } from '@/hooks/useClipboard';
import { useToast } from '@/contexts/NotificationProvider';
import { Icon } from '@/components/Icon';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  /** Optional keyboard shortcut (e.g. "c" triggers on Ctrl+Shift+C / Cmd+Shift+C) */
  keyboardShortcut?: string;
  /** When true, only the icon is rendered (label is still exposed to assistive tech) */
  iconOnly?: boolean;
}

export function CopyButton({
  text,
  label = 'Copy',
  className = '',
  keyboardShortcut,
  iconOnly = false,
}: CopyButtonProps) {
  const { isCopied, copy } = useClipboard();
  const { showToast } = useToast();

  const handleCopy = useCallback(async () => {
    const success = await copy(text);
    if (success) {
      showToast('Copied to clipboard', 'success');
    } else {
      showToast('Failed to copy — please copy manually', 'error');
    }
  }, [copy, text, showToast]);

  // Register optional keyboard shortcut (Ctrl/Cmd + Shift + key)
  useEffect(() => {
    if (!keyboardShortcut) return;

    const handler = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.shiftKey && e.key.toLowerCase() === keyboardShortcut.toLowerCase()) {
        e.preventDefault();
        handleCopy();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keyboardShortcut, handleCopy]);

  const accessibleLabel = isCopied ? 'Copied!' : `${label}: ${text}`;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs border border-line hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors rounded ${className}`}
      aria-label={accessibleLabel}
      title={
        isCopied
          ? 'Copied!'
          : keyboardShortcut
            ? `Copy to clipboard (Ctrl+Shift+${keyboardShortcut.toUpperCase()})`
            : 'Copy to clipboard'
      }
    >
      {isCopied ? (
        <Icon name="copy-check" size={14} className="text-accent" aria-hidden="true" />
      ) : (
        <Icon name="copy" size={14} aria-hidden="true" />
      )}
      {!iconOnly && <span aria-hidden="true">{isCopied ? 'Copied' : label}</span>}
    </button>
  );
}
