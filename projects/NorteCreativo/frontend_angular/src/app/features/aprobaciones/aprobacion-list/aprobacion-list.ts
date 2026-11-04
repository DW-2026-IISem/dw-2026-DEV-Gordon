import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Aprobacion, EstadoAprobacion } from '../../../core/models/aprobacion';
import { VersionEntregable } from '../../../core/models/version-entregable';
import { SessionStore } from '../../../core/services/session-store';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';
import { HasPermission } from '../../../shared/directives/has-permission';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { VersionEntregableApi } from '../../versiones/version-entregable-api';
import { AprobacionApi } from '../aprobacion-api';

interface Option {
  id: EstadoAprobacion | null;
  nombre: string;
}

// Historial de solo lectura: las aprobaciones son un registro de auditoría (el backend solo tiene GET y POST).
@Component({
  imports: [
    DatePipe,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    MessageModule,
    SelectModule,
    PageHeader,
    EmptyState,
    StatusTag,
    HasPermission,
  ],
  selector: 'app-aprobacion-list',
  styleUrl: './aprobacion-list.css',
  templateUrl: './aprobacion-list.html',
})
export class AprobacionList implements OnInit {
  private readonly api = inject(AprobacionApi);
  private readonly versionApi = inject(VersionEntregableApi);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly rows = signal<Aprobacion[]>([]);
  protected readonly versiones = signal<VersionEntregable[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filter = signal('');
  protected readonly estadoFilter = signal<EstadoAprobacion | null>(null);

  protected readonly versionesPorId = computed(
    () => new Map(this.versiones().map((v) => [v.id, v])),
  );
  protected readonly estadoOptions: Option[] = [
    { id: null, nombre: 'Todos los estados' },
    { id: 'APROBADA', nombre: 'Aprobada' },
    { id: 'RECHAZADA', nombre: 'Rechazada' },
  ];

  protected readonly visibleRows = computed(() => {
    const estado = this.estadoFilter();
    const base = this.rows().filter((a) => estado === null || a.estado === estado);
    const ordenadas = [...base].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
    return filterRows(ordenadas, this.filter(), (a) => [
      this.versionLabel(a.version_entregable_id),
      a.comentario,
    ]);
  });

  ngOnInit(): void {
    this.load();
  }

  // «Entregable #<id> · v<numero>»; no depende de tareas (CLIENTE_APROBADOR no las lee).
  protected versionLabel(versionId: number): string {
    const version = this.versionesPorId().get(versionId);
    return version
      ? `Entregable #${version.entregable_id} · v${version.numero_version}`
      : `Versión #${versionId}`;
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    const versiones$: Observable<VersionEntregable[]> = this.session.canPermission(
      'GET /api/version-entregables',
    )
      ? this.versionApi.list()
      : of([]);

    forkJoin({ aprobaciones: this.api.list(), versiones: versiones$ })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ aprobaciones, versiones }) => {
          this.rows.set(aprobaciones);
          this.versiones.set(versiones);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(toApiMessage(err));
          this.loading.set(false);
        },
      });
  }

  protected onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  protected registrar(): void {
    void this.router.navigate(['/aprobaciones/nueva']);
  }
}
