import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { SessionStore } from '../../core/services/session-store';
import { Aside } from '../aside/aside';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  permission: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const DESKTOP = '(min-width: 1024px)';

// Cada ítem declara el permiso que lo muestra; el menú se filtra con SessionStore.canPermission().
const NAV: NavGroup[] = [
  {
    label: 'Operación',
    items: [
      { label: 'Panel', icon: 'pi pi-home', route: '/dashboard', permission: 'GET /api/campanias' },
      { label: 'Clientes', icon: 'pi pi-users', route: '/clientes', permission: 'GET /api/clientes' },
      { label: 'Campañas', icon: 'pi pi-megaphone', route: '/campanias', permission: 'GET /api/campanias' },
      { label: 'Hitos', icon: 'pi pi-flag', route: '/hitos', permission: 'GET /api/hitos' },
      { label: 'Tareas', icon: 'pi pi-check-square', route: '/tareas', permission: 'GET /api/tareas' },
      { label: 'Entregables', icon: 'pi pi-box', route: '/entregables', permission: 'GET /api/entregables' },
      { label: 'Versiones', icon: 'pi pi-clone', route: '/versiones', permission: 'GET /api/version-entregables' },
      { label: 'Aprobaciones', icon: 'pi pi-verified', route: '/aprobaciones', permission: 'GET /api/aprobaciones' },
    ],
  },
];

@Component({
  imports: [Header, Aside, Footer, RouterOutlet, DrawerModule, ConfirmDialogModule],
  selector: 'app-shell',
  providers: [ConfirmationService],
  styleUrl: './shell.css',
  templateUrl: './shell.html',
})
export class Shell {
  private readonly session = inject(SessionStore);
  private readonly breakpoints = inject(BreakpointObserver);

  protected readonly mobileOpen = signal(false);
  protected readonly sidebarCollapsed = signal(false);

  protected readonly navGroups = computed<NavGroup[]>(() =>
    NAV.map((group) => ({
      ...group,
      items: group.items.filter((item) => this.session.canPermission(item.permission)),
    })).filter((group) => group.items.length > 0),
  );

  protected readonly menuItems = computed<MenuItem[]>(() =>
    this.navGroups().map((group) => ({
      label: group.label,
      expanded: true,
      items: group.items.map((item) => ({ label: item.label, icon: item.icon, routerLink: item.route })),
    })),
  );

  // Desde lg el botón alterna el Aside fijo; por debajo abre el Drawer.
  protected onMenuRequested(): void {
    if (this.breakpoints.isMatched(DESKTOP)) {
      this.sidebarCollapsed.update((collapsed) => !collapsed);
    } else {
      this.mobileOpen.set(true);
    }
  }

  protected onNavigated(): void {
    this.mobileOpen.set(false);
  }
}
