import { inject, Service } from '@angular/core';
import { MessageService } from 'primeng/api';

@Service()
export class NotificationService {
  private readonly messages = inject(MessageService);

  success(detail: string, summary = 'Listo'): void {
    this.messages.add({ severity: 'success', summary, detail, life: 4000 });
  }

  info(detail: string, summary = 'Información'): void {
    this.messages.add({ severity: 'info', summary, detail, life: 4000 });
  }

  warn(detail: string, summary = 'Atención'): void {
    this.messages.add({ severity: 'warn', summary, detail, life: 5000 });
  }

  error(detail: string, summary = 'Error'): void {
    this.messages.add({ severity: 'error', summary, detail, life: 6000 });
  }
}
