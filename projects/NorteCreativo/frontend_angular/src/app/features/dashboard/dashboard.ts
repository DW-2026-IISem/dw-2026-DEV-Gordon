import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { Aprobacion } from '../../core/models/aprobacion';
import { Campania } from '../../core/models/campania';
import { Cliente } from '../../core/models/cliente';
import { DashboardResumen } from '../../core/models/dashboard';
import { EstadoHito, Hito } from '../../core/models/hito';
import { VersionEntregable } from '../../core/models/version-entregable';
import { SessionStore } from '../../core/services/session-store';
import { toApiMessage } from '../../core/utils/api-error';
import { formatCop } from '../../core/utils/money';
import { HasPermission } from '../../shared/directives/has-permission';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatusTag } from '../../shared/ui/status-tag/status-tag';
import { AprobacionApi } from '../aprobaciones/aprobacion-api';
import { CampaniaApi } from '../campanias/campania-api';
import { ClienteApi } from '../clientes/cliente-api';
import { HitoApi } from '../hitos/hito-api';
import { VersionEntregableApi } from '../versiones/version-entregable-api';

// Cada petición solo se hace si el rol puede leer ese recurso; si no, llega una lista vacía.
@Component({
  imports: [DatePipe, ButtonModule, CardModule, MessageModule, SkeletonModule, TableModule, PageHeader, EmptyState, StatusTag, HasPermission],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly clienteApi = inject(ClienteApi);
  private readonly campaniaApi = inject(CampaniaApi);
  private readonly hitoApi = inject(HitoApi);
  private readonly versionApi = inject(VersionEntregableApi);
  private readonly aprobacionApi = inject(AprobacionApi);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly campanias = signal<Campania[]>([]);
  protected readonly hitos = signal<Hito[]>([]);
  protected readonly versiones = signal<VersionEntregable[]>([]);
  protected readonly aprobaciones = signal<Aprobacion[]>([]);

  protected readonly skeletons = [1, 2, 3, 4, 5];

  // Los listados del backend ya traen solo registros activos; se cuenta con el mismo criterio.
  protected readonly hitosPorEstado = computed<Record<EstadoHito, number>>(() => {
    const conteo: Record<EstadoHito, number> = { ABIERTO: 0, CERRADO: 0, FACTURADO: 0 };
    for (const h of this.hitos()) conteo[h.estado] += 1;
    return conteo;
  });

  protected readonly resumen = computed<DashboardResumen>(() => ({
    clientes_activos: this.clientes().filter((c) => c.status === 'active').length,
    campanias_activas: this.campanias().filter((c) => c.status === 'active').length,
    hitos_abiertos: this.hitosPorEstado().ABIERTO,
    hitos_cerrados: this.hitosPorEstado().CERRADO,
    versiones_en_revision: this.versiones().filter((v) => v.estado === 'EN_REVISION').length,
  }));

  protected readonly kpis = computed(() => {
    const r = this.resumen();
    return [
      { id: 'clientes', label: 'Clientes activos', value: r.clientes_activos, icon: 'pi pi-users' },
      { id: 'campanias', label: 'Campañas activas', value: r.campanias_activas, icon: 'pi pi-megaphone' },
      { id: 'abiertos', label: 'Hitos abiertos', value: r.hitos_abiertos, icon: 'pi pi-flag' },
      { id: 'cerrados', label: 'Hitos cerrados', value: r.hitos_cerrados, icon: 'pi pi-lock' },
      { id: 'revision', label: 'Versiones en revisión', value: r.versiones_en_revision, icon: 'pi pi-clock' },
    ];
  });

  // Las 5 versiones en revisión más antiguas.
  protected readonly pendientes = computed(() =>
    this.versiones()
      .filter((v) => v.estado === 'EN_REVISION')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id)
      .slice(0, 5),
  );

  // Las 5 aprobaciones más recientes por fecha.
  protected readonly ultimasAprobaciones = computed(() =>
    [...this.aprobaciones()].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id).slice(0, 5),
  );

  ngOnInit(): void {
    this.load();
  }

  protected versionLabel(id: number): string {
    const v = this.versiones().find((x) => x.id === id);
    return v ? `Entregable #${v.entregable_id} · v${v.numero_version}` : `Versión #${id}`;
  }

  protected money(v: VersionEntregable): string {
    return v.total === null ? '—' : formatCop(v.total);
  }

  protected revisar(version: VersionEntregable): void {
    void this.router.navigate(['/aprobaciones/nueva'], { queryParams: { version: version.id } });
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    const si = <T>(permiso: string, request: Observable<T[]>): Observable<T[]> =>
      this.session.canPermission(permiso) ? request : of([]);

    forkJoin({
      clientes: si('GET /api/clientes', this.clienteApi.list()),
      campanias: si('GET /api/campanias', this.campaniaApi.list()),
      hitos: si('GET /api/hitos', this.hitoApi.list()),
      versiones: si('GET /api/version-entregables', this.versionApi.list()),
      aprobaciones: si('GET /api/aprobaciones', this.aprobacionApi.list()),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (datos) => {
          this.clientes.set(datos.clientes);
          this.campanias.set(datos.campanias);
          this.hitos.set(datos.hitos);
          this.versiones.set(datos.versiones);
          this.aprobaciones.set(datos.aprobaciones);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(toApiMessage(err));
          this.loading.set(false);
        },
      });
  }
}
