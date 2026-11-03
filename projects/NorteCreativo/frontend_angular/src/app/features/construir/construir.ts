import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';
import { Aside } from '../../layout/aside/aside';
import { Footer } from '../../layout/footer/footer';
import { Header } from '../../layout/header/header';

const DESKTOP = '(min-width: 1024px)';

@Component({
  imports: [Header, Aside, Footer, DrawerModule],
  selector: 'app-construir',
  styleUrl: './construir.css',
  templateUrl: './construir.html',
})
export class Construir {
  private readonly breakpoints = inject(BreakpointObserver);

  protected readonly mobileOpen = signal(false);
  protected readonly sidebarCollapsed = signal(false);
  protected readonly title = signal('Inicio');

  protected readonly items: MenuItem[] = [
    { label: 'Inicio', icon: 'pi pi-home' },
    { label: 'Clientes', icon: 'pi pi-users' },
    { label: 'Campañas', icon: 'pi pi-megaphone' },
    { label: 'Hitos', icon: 'pi pi-flag' },
    { label: 'Tareas', icon: 'pi pi-check-square' },
    { label: 'Entregables', icon: 'pi pi-box' },
    { label: 'Versiones', icon: 'pi pi-clone' },
    { label: 'Aprobaciones', icon: 'pi pi-verified' },
  ];

  // Desde lg el botón alterna el Aside fijo; por debajo abre el Drawer.
  protected onMenuRequested(): void {
    if (this.breakpoints.isMatched(DESKTOP)) {
      this.sidebarCollapsed.update((collapsed) => !collapsed);
    } else {
      this.mobileOpen.set(true);
    }
  }

  protected onNavigated(label: string): void {
    this.title.set(label);
    this.mobileOpen.set(false);
  }
}
