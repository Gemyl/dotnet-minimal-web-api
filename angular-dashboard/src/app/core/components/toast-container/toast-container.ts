import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from '../../services/toast-service';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css'
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);

  protected iconFor(type: ToastType): string {
    switch (type) {
      case 'success': return '✓';
      case 'info': return 'i';
      case 'warning': return '!';
      case 'error': return '×';
    }
  }
}
