import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Entregable, EntregablePayload, EstadoEntregable } from '../../../core/models/entregable';
import { Hito } from '../../../core/models/hito';
import { Tarea } from '../../../core/models/tarea';
import { NotificationService } from '../../../core/services/notification';
import { SessionStore } from '../../../core/services/session-store';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';
import { formatCop } from '../../../core/utils/money';
import { HasPermission } from '../../../shared/directives/has-permission';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { HitoApi } from '../../hitos/hito-api';
import { TareaApi } from '../../tareas/tarea-api';
import { EntregableApi } from '../entregable-api';
import { EntregableForm } from '../entregable-form/entregable-form';
import { TooltipModule } from 'primeng/tooltip';

interface Option<T> {
  id: T | null;
  nombre: string;
}

@Component({
  imports: [
    TooltipModule,
    DatePipe,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    MessageModule,
    SelectModule,
    PageHeader,
    EmptyState,
    StatusTag,
    HasPermission,
    EntregableForm,
  ],
  selector: 'app-entregable-list',
  styleUrl: './entregable-list.css',
  templateUrl: './entregable-list.html',
})
export class EntregableList implements OnInit {
  private readonly api = inject(EntregableApi);
  private readonly tareaApi = inject(TareaApi);
  private readonly hitoApi = inject(HitoApi);
  private readonly session = inject(SessionStore);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly rows = signal<Entregable[]>([]);
  protected readonly tareas = signal<Tarea[]>([]);
  protected readonly hitos = signal<Hito[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly dialogError = signal<string | null>(null);
  protected readonly filter = signal('');
  protected readonly tareaFilter = signal<number | null>(null);
  protected readonly estadoFilter = signal<EstadoEntregable | null>(null);
  protected readonly dialogVisible = signal(false);
  protected readonly editing = signal<Entregable | null>(null);
  protected readonly resetKey = signal(0);

  protected readonly tareasPorId = computed(
    () => new Map(this.tareas().map((t) => [t.id, t.nombre])),
  );
  protected readonly hitosPorId = computed(
    () => new Map(this.hitos().map((h) => [h.id, h.nombre])),
  );
  protected readonly tareaOptions = computed<Option<number>[]>(() => [
    { id: null, nombre: 'Todas las tareas' },
    ...this.tareas().map((t) => ({ id: t.id, nombre: t.nombre })),
  ]);
  protected readonly estadoOptions: Option<EstadoEntregable>[] = [
    { id: null, nombre: 'Todos los estados' },
    { id: 'EN_PROCESO', nombre: 'En proceso' },
    { id: 'ENTREGADO', nombre: 'Entregado' },
  ];

  protected readonly visibleRows = computed(() => {
    const tareaId = this.tareaFilter();
    const estado = this.estadoFilter();
    const nombres = this.tareasPorId();
    const base = this.rows().filter(
      (e) =>
        (tareaId === null || e.tarea_id === tareaId) && (estado === null || e.estado === estado),
    );
    return filterRows(base, this.filter(), (e) => [nombres.get(e.tarea_id), e.observaciones]);
  });
  // Sin ninguna acción permitida, la columna «Acciones» no se muestra.
  protected readonly hasActions = computed(() =>
    this.session.canAny([
      'GET /api/entregables/:id',
      'PATCH /api/entregables/:id',
      'PATCH /api/entregables/:id/deactivate',
      'DELETE /api/entregables/:id',
    ]),
  );
  protected readonly title = computed(() =>
    this.editing() ? 'Editar entregable' : 'Nuevo entregable',
  );

  ngOnInit(): void {
    this.load();
  }

  protected tareaNombre(id: number): string {
    return this.tareasPorId().get(id) ?? `Tarea #${id}`;
  }

  protected money(value: Entregable['total']): string {
    return value === null ? '—' : formatCop(value);
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    const tareas$: Observable<Tarea[]> = this.session.canPermission('GET /api/tareas')
      ? this.tareaApi.list()
      : of([]);
    const hitos$: Observable<Hito[]> = this.session.canPermission('GET /api/hitos')
      ? this.hitoApi.list()
      : of([]);

    forkJoin({ entregables: this.api.list(), tareas: tareas$, hitos: hitos$ })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ entregables, tareas, hitos }) => {
          this.rows.set(entregables);
          this.tareas.set(tareas);
          this.hitos.set(hitos);
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

  protected verDetalle(entregable: Entregable): void {
    void this.router.navigate(['/entregables', entregable.id]);
  }

  protected openNew(): void {
    this.editing.set(null);
    this.openDialog();
  }

  protected openEdit(entregable: Entregable): void {
    this.editing.set(entregable);
    this.openDialog();
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
  }

  protected save(payload: EntregablePayload): void {
    const editing = this.editing();
    const request = editing ? this.api.update(editing.id, payload) : this.api.create(payload);

    this.saving.set(true);
    this.dialogError.set(null);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(editing ? 'Entregable actualizado.' : 'Entregable creado.');
        this.load();
      },
      error: (err: unknown) => {
        const message = toApiMessage(err);
        this.saving.set(false);
        this.dialogError.set(message);
        this.notify.error(message);
      },
    });
  }

  protected confirmDeactivate(entregable: Entregable): void {
    this.confirmation.confirm({
      header: 'Desactivar entregable',
      message: `¿Desactivar el entregable de «${this.tareaNombre(entregable.tarea_id)}»? Dejará de aparecer en la lista.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Desactivar', severity: 'warn' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.deactivate(entregable.id), 'Entregable desactivado.'),
    });
  }

  protected confirmRemove(entregable: Entregable): void {
    this.confirmation.confirm({
      header: 'Eliminar entregable',
      message: `¿Eliminar definitivamente el entregable de «${this.tareaNombre(entregable.tarea_id)}»? Esta acción es irreversible.`,
      icon: 'pi pi-trash',
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.remove(entregable.id), 'Entregable eliminado.'),
    });
  }

  private openDialog(): void {
    this.dialogError.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  private run(request: Observable<unknown>, success: string): void {
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notify.success(success);
        this.load();
      },
      error: (err: unknown) => this.notify.error(toApiMessage(err)),
    });
  }
}
