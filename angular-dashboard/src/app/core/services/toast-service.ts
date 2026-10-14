import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;

  readonly toasts = this._toasts.asReadonly();

  success(message: string, duration = 4000): void {
    this.show(message, 'success', duration);
  }

  info(message: string, duration = 4000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 4000): void {
    this.show(message, 'warning', duration);
  }

  error(message: string, duration = 4000): void {
    this.show(message, 'error', duration);
  }

  show(message: string, type: ToastType, duration = 4000): void {
    const id = ++this.nextId;
    this._toasts.update((toasts) => [...toasts, { id, type, message }]);

    if (duration > 0) {
      this.timers.set(id, setTimeout(() => this.dismiss(id), duration));
    }
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
