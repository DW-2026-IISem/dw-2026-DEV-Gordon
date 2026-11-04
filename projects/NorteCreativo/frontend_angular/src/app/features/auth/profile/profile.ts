import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { SessionStore } from '../../../core/services/session-store';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

@Component({
  imports: [ButtonModule, IconFieldModule, InputIconModule, InputTextModule, TableModule, TagModule, PageHeader, EmptyState],
  selector: 'app-profile',
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  protected readonly session = inject(SessionStore);

  protected readonly filter = signal('');
  protected readonly refreshing = signal(false);

  protected readonly visiblePermisos = computed(() =>
    filterRows(this.session.permisos(), this.filter(), (p) => [p.method, p.path, p.roles.join(' ')]),
  );

  protected onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  // Vuelve a pedir perfil y permisos: útil si un administrador cambió los roles.
  protected actualizar(): void {
    this.refreshing.set(true);
    this.auth.me().subscribe({
      next: () => {
        this.refreshing.set(false);
        this.notify.success('Permisos actualizados.');
      },
      error: (err: unknown) => {
        this.refreshing.set(false);
        this.notify.error(toApiMessage(err));
      },
    });
  }

  protected cerrarSesion(): void {
    this.auth.logout().subscribe(() => void this.router.navigate(['/login']));
  }
}
