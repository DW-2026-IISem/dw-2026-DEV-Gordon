import { Component, computed, DestroyRef, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
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
import { Entregable } from '../../../core/models/entregable';
import { Tarea } from '../../../core/models/tarea';
import { EstadoVersion, VersionEntregable, VersionEntregablePayload } from '../../../core/models/version-entregable';
import { NotificationService } from '../../../core/services/notification';
import { SessionStore } from '../../../core/services/session-store';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';
import { formatCop } from '../../../core/utils/money';
import { HasPermission } from '../../../shared/directives/has-permission';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { EntregableApi } from '../../entregables/entregable-api';
import { TareaApi } from '../../tareas/tarea-api';
import { VersionEntregableApi } from '../version-entregable-api';
import { VersionForm } from '../version-form/version-form';

interface Option<T> {
  id: T | null;
  nombre: string;
}

// Sirve como pantalla /versiones (global) y, con entregableId, como tabla del detalle de un entregable.
@Component({
  imports: [
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
    VersionForm,
  ],
  selector: 'app-version-list',
  styleUrl: './version-list.css',
  templateUrl: './version-list.html',
})
export class VersionList implements OnInit {
  private readonly api = inject(VersionEntregableApi);
  private readonly entregableApi = inject(EntregableApi);
  private readonly tareaApi = inject(TareaApi);
  private readonly session = inject(SessionStore);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  // Con entregableId la tabla es la del detalle: solo sus versiones y "Nueva versión" con ese entregable fijo.
  readonly entregableId = input<number | undefined>();
  // Cada carga entrega las versiones visibles para que el detalle calcule su resumen.
  readonly loaded = output<VersionEntregable[]>();

  protected readonly rows = signal<VersionEntregable[]>([]);
  protected readonly entregables = signal<Entregable[]>([]);
  protected readonly tareas = signal<Tarea[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly dialogError = signal<string | null>(null);
  protected readonly filter = signal('');
  protected readonly entregableFilter = signal<number | null>(null);
  protected readonly estadoFilter = signal<EstadoVersion | null>(null);
  protected readonly dialogVisible = signal(false);
  protected readonly editing = signal<VersionEntregable | null>(null);
  protected readonly resetKey = signal(0);
  // En el diálogo: el entregable fijo (detalle) o el de la versión que se edita (lista global).
  protected readonly dialogEntregableId = signal<number | null>(null);

  protected readonly tareasPorId = computed(() => new Map(this.tareas().map((t) => [t.id, t.nombre])));
  protected readonly entregablesPorId = computed(() => new Map(this.entregables().map((e) => [e.id, e])));

  protected readonly estadoOptions: Option<EstadoVersion>[] = [
    { id: null, nombre: 'Todos los estados' },
    { id: 'EN_REVISION', nombre: 'En revisión' },
    { id: 'APROBADA', nombre: 'Aprobada' },
    { id: 'RECHAZADA', nombre: 'Rechazada' },
  ];

  protected readonly entregableOptions = computed<Option<number>[]>(() => [
    { id: null, nombre: 'Todos los entregables' },
    ...this.entregables().map((e) => ({ id: e.id, nombre: this.entregableLabel(e.id) })),
  ]);

  protected readonly visibleRows = computed(() => {
    const entregableId = this.entregableFilter();
    const estado = this.estadoFilter();
    const fijo = this.entregableId();
    const base = this.rows()
      .filter((v) => (fijo === undefined || v.entregable_id === fijo))
      .filter((v) => (entregableId === null || v.entregable_id === entregableId) && (estado === null || v.estado === estado));
    const ordenadas = [...base].sort((a, b) => b.numero_version - a.numero_version || b.id - a.id);
    return filterRows(ordenadas, this.filter(), (v) => [this.entregableLabel(v.entregable_id), v.observaciones, `v${v.numero_version}`]);
  });

  // Sin ninguna acción permitida, la columna «Acciones» no se muestra.
  protected readonly hasActions = computed(() => this.session.canAny(['PATCH /api/version-entregables/:id', 'PATCH /api/version-entregables/:id/deactivate', 'DELETE /api/version-entregables/:id', 'POST /api/aprobaciones']));
  protected readonly title = computed(() => (this.editing() ? 'Editar versión' : 'Nueva versión'));

  constructor() {
    effect(() => {
      // Cada vez que cambian las filas del entregable del detalle, se avisa al padre.
      const fijo = this.entregableId();
      if (fijo !== undefined) this.loaded.emit(this.rows().filter((v) => v.entregable_id === fijo));
    });
  }

  ngOnInit(): void {
    this.load();
  }

  // «Tarea · total»; si el rol no lee tareas o entregables, «#id · total».
  protected entregableLabel(id: number): string {
    const entregable = this.entregablesPorId().get(id);
    const tarea = entregable ? this.tareasPorId().get(entregable.tarea_id) : undefined;
    const total = entregable ? formatCop(entregable.total) : '';
    return `${tarea ?? `#${id}`}${total ? ` · ${total}` : ''}`;
  }

  protected money(value: VersionEntregable['total']): string {
    return value === null ? '—' : formatCop(value);
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    const global = this.entregableId() === undefined;
    const entregables$: Observable<Entregable[]> =
      global && this.session.canPermission('GET /api/entregables') ? this.entregableApi.list() : of([]);
    const tareas$: Observable<Tarea[]> =
      global && this.session.canPermission('GET /api/tareas') ? this.tareaApi.list() : of([]);

    forkJoin({ versiones: this.api.list(), entregables: entregables$, tareas: tareas$ })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ versiones, entregables, tareas }) => {
          this.rows.set(versiones);
          this.entregables.set(entregables);
          this.tareas.set(tareas);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(toApiMessage(err));
          this.loading.set(false);
        },
      });
  }

  // Lleva al formulario de veredicto con esta versión ya elegida.
  protected revisar(version: VersionEntregable): void {
    void this.router.navigate(['/aprobaciones/nueva'], { queryParams: { version: version.id } });
  }

  protected onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  protected openNew(): void {
    this.editing.set(null);
    this.dialogEntregableId.set(this.entregableId() ?? null);
    this.openDialog();
  }

  protected openEdit(version: VersionEntregable): void {
    this.editing.set(version);
    this.dialogEntregableId.set(version.entregable_id);
    this.openDialog();
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
  }

  // Crear: POST sin numero_version ni estado. Editar: PATCH; si la versión es APROBADA el backend responde 409 (RN-04).
  protected save(payload: VersionEntregablePayload): void {
    const editing = this.editing();
    const request = editing ? this.api.update(editing.id, payload) : this.api.create(payload);

    this.saving.set(true);
    this.dialogError.set(null);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (version) => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(editing ? `Versión ${version.numero_version} actualizada.` : `Versión ${version.numero_version} creada.`);
        this.load();
      },
      error: (err: unknown) => {
        // 409 RN-06 (hito no ABIERTO) o RN-04: el diálogo sigue abierto.
        const message = toApiMessage(err);
        this.saving.set(false);
        this.dialogError.set(message);
        this.notify.error(message);
      },
    });
  }

  protected confirmDeactivate(version: VersionEntregable): void {
    this.confirmation.confirm({
      header: 'Desactivar versión',
      message: `¿Desactivar la versión ${version.numero_version}? Dejará de aparecer en la lista.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Desactivar', severity: 'warn' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.deactivate(version.id), `Versión ${version.numero_version} desactivada.`),
    });
  }

  protected confirmRemove(version: VersionEntregable): void {
    this.confirmation.confirm({
      header: 'Eliminar versión',
      message: `¿Eliminar definitivamente la versión ${version.numero_version}? Esta acción es irreversible.`,
      icon: 'pi pi-trash',
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.remove(version.id), `Versión ${version.numero_version} eliminada.`),
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
