// core/services/toast.service.ts
import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts = signal<ToastMessage[]>([]);
  public toasts$ = this.toasts.asReadonly();
  private counter = 0;

  private show(
    message: string,
    type: ToastMessage['type'],
    title: string,
    duration: number = 3000,
  ) {
    const toast: ToastMessage = {
      id: ++this.counter,
      type,
      title,
      message,
      duration: type === 'error' ? 5000 : duration,
    };

    this.toasts.update((current) => [toast, ...current]);

    setTimeout(() => {
      this.remove(toast.id);
    }, toast.duration);
  }

  success(message: string, title: string = 'نجاح') {
    this.show(message, 'success', title);
  }

  error(message: string, title: string = 'خطأ') {
    this.show(message, 'error', title);
  }

  warning(message: string, title: string = 'تنبيه') {
    this.show(message, 'warning', title);
  }

  info(message: string, title: string = 'معلومة') {
    this.show(message, 'info', title);
  }

  remove(id: number) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clear() {
    this.toasts.set([]);
  }
}
