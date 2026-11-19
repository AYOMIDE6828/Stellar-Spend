'use client';

import { useEffect } from 'react';
import { useClipboard } from '@/hooks/useClipboard';
import { useToast } from '@/contexts/NotificationProvider';
import { Icon } from '@/components/Icon';
import { useTranslations } from '@/hooks/useTranslations';

/** Icon size (px) used for the copy/copy-check glyphs. */
const COPY_ICON_SIZE = 14;

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  /** Optional keyboard shortcut (e.g. "c" triggers on Ctrl+Shift+C / Cmd+Shift+C) */
  keyboardShortcut?: string;
}

export function CopyButton({
  text,
  label,
  className = '',
  keyboardShortcut,
}: CopyButtonProps) {
  const { isCopied, copy } = useClipboard();
  const { showToast } = useToast();
  const { t } = useTranslations();

  const resolvedLabel = label ?? t('copyButton.label');

  const handleCopy = async () => {
    const success = await copy(text);
    if (success) {
      showToast(t('copyButton.success'), 'success');
    } else {
      showToast(t('copyButton.error'), 'error');
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboardShortcut, text]);

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs border border-line hover:border-accent transition-colors rounded ${className}`}
      aria-label={
        isCopied
          ? t('copyButton.copiedAria')
          : t('copyButton.ariaLabel', { label: resolvedLabel, text })
      }
      title={
        isCopied
          ? t('copyButton.copiedAria')
          : keyboardShortcut
            ? t('copyButton.titleWithShortcut', {
                shortcut: keyboardShortcut.toUpperCase(),
              })
            : t('copyButton.title')
      }
    >
      {isCopied ? (
        <Icon name="copy-check" size={COPY_ICON_SIZE} className="text-accent" />
      ) : (
        <Icon name="copy" size={COPY_ICON_SIZE} />
      )}
      <span>{isCopied ? t('copyButton.copied') : resolvedLabel}</span>
    </button>
  );
}
