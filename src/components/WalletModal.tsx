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
 * Note (#1450, #1451): All user-facing strings and magic values are owned by
 * the underlying implementation in '@/features/wallet'. This shim intentionally
 * contains no hardcoded text or inline values; it only re-exports.
 */
export { WalletModal, WALLET_OPTIONS } from '@/features/wallet';
export type { WalletModalProps, WalletOption } from '@/features/wallet';

export { WalletModal as default } from '@/features/wallet';