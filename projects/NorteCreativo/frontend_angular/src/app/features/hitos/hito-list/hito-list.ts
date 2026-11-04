import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, input, OnInit, signal } from '@angular/core';
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
import { Campania } from '../../../core/models/campania';
import { EstadoHito, Hito, HitoPayload } from '../../../core/models/hito';
import { NotificationService } from '../../../core/services/notification';
import { SessionStore } from '../../../core/services/session-store';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';
import { HasPermission } from '../../../shared/directives/has-permission';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { CampaniaApi } from '../../campanias/campania-api';
import { HitoApi } from '../hito-api';
import { HitoForm } from '../hito-form/hito-form';

interface Option<T> {
  id: T | null;
  nombre: string;
}

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
    HitoForm,
  ],
  selector: 'app-hito-list',
  styleUrl: './hito-list.css',
  templateUrl: './hito-list.html',
})
export class HitoList implements OnInit {
  private readonly api = inject(HitoApi);
  private readonly campaniaApi = inject(CampaniaApi);
  private readonly session = inject(SessionStore);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  // /hitos?campania=<id>: withComponentInputBinding entrega el query param como input.
  readonly campania = input<string | undefined>();

  protected readonly rows = signal<Hito[]>([]);
  protected readonly campanias = signal<Campania[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly dialogError = signal<string | null>(null);
  protected readonly filter = signal('');
  protected readonly campaniaFilter = signal<number | null>(null);
  protected readonly estadoFilter = signal<EstadoHito | null>(null);
  protected readonly dialogVisible = signal(false);
  protected readonly editing = signal<Hito | null>(null);
  protected readonly resetKey = signal(0);

  protected readonly campaniasPorId = computed(() => new Map(this.campanias().map((c) => [c.id, c.nombre])));
  protected readonly campaniaOptions = computed<Option<number>[]>(() => [
    { id: null, nombre: 'Todas las campañas' },
    ...this.campanias().map((c) => ({ id: c.id, nombre: c.nombre })),
  ]);
  protected readonly estadoOptions: Option<EstadoHito>[] = [
    { id: null, nombre: 'Todos los estados' },
    { id: 'ABIERTO', nombre: 'Abierto' },
    { id: 'CERRADO', nombre: 'Cerrado' },
    { id: 'FACTURADO', nombre: 'Facturado' },
  ];

  // Cuenta sobre todos los hitos cargados, no sobre los filtrados.
  protected readonly abiertosCount = computed(() => this.rows().filter((h) => h.estado === 'ABIERTO').length);

  protected readonly visibleRows = computed(() => {
    const campaniaId = this.campaniaFilter();
    const estado = this.estadoFilter();
    const nombres = this.campaniasPorId();
    const base = this.rows().filter(
      (h) => (campaniaId === null || h.campania_id === campaniaId) && (estado === null || h.estado === estado),
    );
    return filterRows(base, this.filter(), (h) => [h.nombre, h.descripcion, nombres.get(h.campania_id)]);
  });
  // Sin ninguna acción permitida, la columna «Acciones» no se muestra.
  protected readonly hasActions = computed(() => this.session.canAny(['GET /api/tareas', 'PATCH /api/hitos/:id', 'PATCH /api/hitos/:id/deactivate', 'DELETE /api/hitos/:id']));
  protected readonly title = computed(() => (this.editing() ? 'Editar hito' : 'Nuevo hito'));

  constructor() {
    effect(() => {
      const id = Number(this.campania());
      this.campaniaFilter.set(Number.isInteger(id) && id > 0 ? id : null);
    });
  }

  ngOnInit(): void {
    this.load();
  }

  protected campaniaNombre(id: number): string {
    return this.campaniasPorId().get(id) ?? `Campaña #${id}`;
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    const campanias$: Observable<Campania[]> = this.session.canPermission('GET /api/campanias')
      ? this.campaniaApi.list()
      : of([]);

    forkJoin({ hitos: this.api.list(), campanias: campanias$ })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ hitos, campanias }) => {
          this.rows.set(hitos);
          this.campanias.set(campanias);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(toApiMessage(err));
          this.loading.set(false);
        },
      });
  }

  // Abre /tareas ya filtrado por este hito.
  protected verTareas(hito: Hito): void {
    void this.router.navigate(['/tareas'], { queryParams: { hito: hito.id } });
  }

  protected onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  protected openNew(): void {
    this.editing.set(null);
    this.openDialog();
  }

  protected openEdit(hito: Hito): void {
    this.editing.set(hito);
    this.openDialog();
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
  }

  // El payload nunca lleva estado ni fecha_cierre.
  protected save(payload: HitoPayload): void {
    const editing = this.editing();
    const request = editing ? this.api.update(editing.id, payload) : this.api.create(payload);

    this.saving.set(true);
    this.dialogError.set(null);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (hito) => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(editing ? `Hito «${hito.nombre}» actualizado.` : `Hito «${hito.nombre}» creado.`);
        this.load();
      },
      error: (err: unknown) => {
        // 409 (RN-08, campaña inactiva) o 404: el diálogo sigue abierto.
        const message = toApiMessage(err);
        this.saving.set(false);
        this.dialogError.set(message);
        this.notify.error(message);
      },
    });
  }

  protected confirmDeactivate(hito: Hito): void {
    this.confirmation.confirm({
      header: 'Desactivar hito',
      message: `¿Desactivar el hito «${hito.nombre}»? Dejará de aparecer en la lista.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Desactivar', severity: 'warn' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.deactivate(hito.id), `Hito «${hito.nombre}» desactivado.`),
    });
  }

  protected confirmRemove(hito: Hito): void {
    this.confirmation.confirm({
      header: 'Eliminar hito',
      message: `¿Eliminar definitivamente el hito «${hito.nombre}»? Esta acción es irreversible.`,
      icon: 'pi pi-trash',
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.remove(hito.id), `Hito «${hito.nombre}» eliminado.`),
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
