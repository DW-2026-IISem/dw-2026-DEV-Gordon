import { Component, computed, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';
import { SessionStore } from '../../core/services/session-store';
import { toApiMessage } from '../../core/utils/api-error';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  imports: [TooltipModule, ButtonModule, AvatarModule, MenuModule],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  protected readonly session = inject(SessionStore);

  protected readonly title = 'Norte Creativo';
  readonly menuRequested = output<void>();

  protected readonly inicial = computed(() =>
    (this.session.usuario()?.username ?? '?').charAt(0).toUpperCase(),
  );

  protected readonly userItems: MenuItem[] = [
    {
      label: 'Mi sesión',
      icon: 'pi pi-user',
      command: () => void this.router.navigate(['/perfil']),
    },
    {
      label: 'Actualizar permisos',
      icon: 'pi pi-refresh',
      command: () =>
        this.auth.me().subscribe({
          next: () => this.notify.success('Permisos actualizados.'),
          error: (err: unknown) => this.notify.error(toApiMessage(err)),
        }),
    },
    { separator: true },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => this.auth.logout().subscribe(() => void this.router.navigate(['/login'])),
    },
  ];
}
