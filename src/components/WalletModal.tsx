/**
 * @deprecated (#1044) — Moved to src/features/wallet/.
 *
 * This file is a re-export shim that keeps existing import paths working.
 * New code should import from '@/features/wallet' instead.
 *
 * Migration:
 *   Before: import { WalletModal } from '@/components/WalletModal'
 *   After:  import { WalletModal } from '@/features/wallet'
 *
 * Accessibility (#1434, #1435):
 *   Keyboard navigation and focus management (focus trap, initial focus,
 *   focus restoration on close, Escape-to-close, logical tab order) and
 *   ARIA labels/roles are implemented in the canonical component at
 *   '@/features/wallet'. This shim re-exports that implementation so all
 *   existing import paths inherit the accessible behavior.
 */
export { WalletModal, WALLET_OPTIONS } from '@/features/wallet';
export type { WalletModalProps, WalletOption } from '@/features/wallet';

export { WalletModal as default } from '@/features/wallet';