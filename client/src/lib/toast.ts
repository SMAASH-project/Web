/**
 * Minimal pub/sub toast store — no external dependencies.
 *
 * Usage:
 *   import { toast } from '@/lib/toast';
 *   toast.success('Saved!');
 *   toast.error('Something went wrong.');
 *   toast.info('Loading…');
 */

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

function add(type: ToastType, message: string, durationMs = 4000) {
  const id = Math.random().toString(36).slice(2, 9);
  toasts = [...toasts, { id, type, message }];
  notify();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, durationMs);
}

export const toast = {
  success: (message: string) => add("success", message),
  error: (message: string) => add("error", message),
  info: (message: string) => add("info", message),
  /** Subscribe to toast list changes. Returns an unsubscribe function. */
  subscribe: (fn: Listener) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
