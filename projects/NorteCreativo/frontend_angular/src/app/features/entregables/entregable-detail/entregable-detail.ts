import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { Entregable } from '../../../core/models/entregable';
import { Tarea } from '../../../core/models/tarea';
import { VersionEntregable } from '../../../core/models/version-entregable';
import { SessionStore } from '../../../core/services/session-store';
import { toApiMessage } from '../../../core/utils/api-error';
import { formatCop } from '../../../core/utils/money';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { TareaApi } from '../../tareas/tarea-api';
import { VersionList } from '../../versiones/version-list/version-list';
import { EntregableApi } from '../entregable-api';

// Cabecera (entregable) + líneas (sus versiones). El id llega de la ruta como input.
@Component({
  imports: [DatePipe, ButtonModule, MessageModule, PageHeader, StatusTag, VersionList],
  selector: 'app-entregable-detail',
  styleUrl: './entregable-detail.css',
  templateUrl: './entregable-detail.html',
})
export class EntregableDetail {
  private readonly api = inject(EntregableApi);
  private readonly tareaApi = inject(TareaApi);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input.required<string>();

  protected readonly entregable = signal<Entregable | null>(null);
  protected readonly tarea = signal<Tarea | null>(null);
  protected readonly versiones = signal<VersionEntregable[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly entregableId = computed(() => Number(this.id()));
  protected readonly ultimaVersion = computed(() =>
    this.versiones().reduce<VersionEntregable | null>(
      (max, v) => (!max || v.numero_version > max.numero_version ? v : max),
      null,
    ),
  );
  protected readonly pendientes = computed(
    () => this.versiones().filter((v) => v.estado === 'EN_REVISION').length,
  );
  protected readonly total = computed(() => {
    const e = this.entregable();
    return e && e.total !== null ? formatCop(e.total) : '—';
  });

  constructor() {
    effect(() => this.load(this.entregableId()));
  }

  protected volver(): void {
    void this.router.navigate(['/entregables']);
  }

  private load(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entregable) => {
          this.entregable.set(entregable);
          const tarea$: Observable<Tarea | null> = this.session.canPermission('GET /api/tareas/:id')
            ? this.tareaApi.get(entregable.tarea_id)
            : of(null);
          forkJoin({ tarea: tarea$ })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: ({ tarea }) => {
                this.tarea.set(tarea);
                this.loading.set(false);
              },
              error: () => this.loading.set(false),
            });
        },
        error: (err: unknown) => {
          this.error.set(toApiMessage(err));
          this.loading.set(false);
        },
      });
  }
}
