import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

// Destino del permissionGuard: /forbidden?permission=GET /api/tareas (llega como input por withComponentInputBinding).
@Component({
  imports: [ButtonModule, PageHeader, EmptyState],
  selector: 'app-forbidden',
  styleUrl: './forbidden.css',
  templateUrl: './forbidden.html',
})
export class Forbidden {
  private readonly router = inject(Router);
  readonly permission = input<string>();

  protected goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
