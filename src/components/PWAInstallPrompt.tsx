'use client';

import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { CHROME_TOKENS } from '@/lib/theme-tokens';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STANDALONE_DISPLAY_MODE = '(display-mode: standalone)';
const INSTALL_OUTCOME_ACCEPTED = 'accepted';

const PWA_INSTALL_COPY = {
  title: 'Install Stellar-Spend',
  description:
    'Install our app for faster access and offline support. Works on mobile and desktop.',
  installLabel: 'Install',
  laterLabel: 'Later',
  closeLabel: 'Close',
  icon: '📱',
  closeIcon: '✕',
} as const;

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia(STANDALONE_DISPLAY_MODE).matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === INSTALL_OUTCOME_ACCEPTED) {
        setIsInstalled(true);
      }
      setShowPrompt(false);
      setDeferredPrompt(null);
    } catch (err) {
      logger.error('Installation failed:', {}, err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  // Installation requires a network connection; hide the prompt while offline.
  if (!showPrompt || isInstalled || !isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="rounded-lg p-4 shadow-lg backdrop-filter backdrop-blur-sm border"
        style={{ backgroundColor: CHROME_TOKENS.surface, borderColor: CHROME_TOKENS.border }}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-xl">{PWA_INSTALL_COPY.icon}</div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-1"
              style={{ color: CHROME_TOKENS.gold }}>{PWA_INSTALL_COPY.title}</h3>
            <p className="text-xs mb-3"
              style={{ color: CHROME_TOKENS.textDim }}>
              {PWA_INSTALL_COPY.description}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className={cn(
                  'flex-1 px-3 py-2 text-xs font-semibold tracking-widest uppercase',
                  'rounded transition-colors duration-150 focus:outline-none',
                )}
                style={{ backgroundColor: CHROME_TOKENS.gold, color: CHROME_TOKENS.surface }}
              >
                {PWA_INSTALL_COPY.installLabel}
              </button>
              <button
                onClick={handleDismiss}
                className={cn(
                  'flex-1 px-3 py-2 text-xs font-semibold tracking-widest uppercase',
                  'border rounded transition-colors duration-150 focus:outline-none',
                )}
                style={{ borderColor: CHROME_TOKENS.borderMuted, color: CHROME_TOKENS.borderMuted }}
              >
                {PWA_INSTALL_COPY.laterLabel}
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 transition-colors"
            style={{ color: CHROME_TOKENS.textFaint }}
            aria-label={PWA_INSTALL_COPY.closeLabel}
          >
            {PWA_INSTALL_COPY.closeIcon}
          </button>
        </div>
      </div>
    </div>
  );
}
