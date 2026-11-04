import { Component, computed, DestroyRef, effect, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
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
import { Hito } from '../../../core/models/hito';
import { Tarea, TareaPayload } from '../../../core/models/tarea';
import { NotificationService } from '../../../core/services/notification';
import { SessionStore } from '../../../core/services/session-store';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';
import { HasPermission } from '../../../shared/directives/has-permission';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { CampaniaApi } from '../../campanias/campania-api';
import { HitoApi } from '../../hitos/hito-api';
import { TareaApi } from '../tarea-api';
import { TareaForm } from '../tarea-form/tarea-form';

interface HitoOption {
  id: number | null;
  nombre: string;
}

@Component({
  imports: [
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
    TareaForm,
  ],
  selector: 'app-tarea-list',
  styleUrl: './tarea-list.css',
  templateUrl: './tarea-list.html',
})
export class TareaList implements OnInit {
  private readonly api = inject(TareaApi);
  private readonly hitoApi = inject(HitoApi);
  private readonly campaniaApi = inject(CampaniaApi);
  private readonly session = inject(SessionStore);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  // /tareas?hito=<id>: withComponentInputBinding entrega el query param como input.
  readonly hito = input<string | undefined>();

  protected readonly rows = signal<Tarea[]>([]);
  protected readonly hitos = signal<Hito[]>([]);
  protected readonly campanias = signal<Campania[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly dialogError = signal<string | null>(null);
  protected readonly filter = signal('');
  protected readonly hitoFilter = signal<number | null>(null);
  protected readonly dialogVisible = signal(false);
  protected readonly editing = signal<Tarea | null>(null);
  protected readonly resetKey = signal(0);

  protected readonly hitosPorId = computed(() => new Map(this.hitos().map((h) => [h.id, h.nombre])));
  protected readonly campaniasPorId = computed(() => new Map(this.campanias().map((c) => [c.id, c.nombre])));
  protected readonly hitoOptions = computed<HitoOption[]>(() => [
    { id: null, nombre: 'Todos los hitos' },
    ...this.hitos().map((h) => ({ id: h.id, nombre: h.nombre })),
  ]);

  protected readonly visibleRows = computed(() => {
    const hitoId = this.hitoFilter();
    const nombres = this.hitosPorId();
    const base = hitoId === null ? this.rows() : this.rows().filter((t) => t.hito_id === hitoId);
    return filterRows(base, this.filter(), (t) => [t.nombre, t.descripcion, nombres.get(t.hito_id)]);
  });
  protected readonly title = computed(() => (this.editing() ? 'Editar tarea' : 'Nueva tarea'));

  constructor() {
    effect(() => {
      const id = Number(this.hito());
      this.hitoFilter.set(Number.isInteger(id) && id > 0 ? id : null);
    });
  }

  ngOnInit(): void {
    this.load();
  }

  protected hitoNombre(id: number): string {
    return this.hitosPorId().get(id) ?? `Hito #${id}`;
  }

  // Tareas, hitos y campañas en paralelo; lo que no se puede leer por permisos queda como lista vacía.
  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    const hitos$: Observable<Hito[]> = this.session.canPermission('GET /api/hitos') ? this.hitoApi.list() : of([]);
    const campanias$: Observable<Campania[]> = this.session.canPermission('GET /api/campanias')
      ? this.campaniaApi.list()
      : of([]);

    forkJoin({ tareas: this.api.list(), hitos: hitos$, campanias: campanias$ })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ tareas, hitos, campanias }) => {
          this.rows.set(tareas);
          this.hitos.set(hitos);
          this.campanias.set(campanias);
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

  protected openNew(): void {
    this.editing.set(null);
    this.openDialog();
  }

  protected openEdit(tarea: Tarea): void {
    this.editing.set(tarea);
    this.openDialog();
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
  }

  protected save(payload: TareaPayload): void {
    const editing = this.editing();
    const request = editing ? this.api.update(editing.id, payload) : this.api.create(payload);

    this.saving.set(true);
    this.dialogError.set(null);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (tarea) => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(editing ? `Tarea «${tarea.nombre}» actualizada.` : `Tarea «${tarea.nombre}» creada.`);
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

  protected confirmDeactivate(tarea: Tarea): void {
    this.confirmation.confirm({
      header: 'Desactivar tarea',
      message: `¿Desactivar la tarea «${tarea.nombre}»? Dejará de aparecer en la lista.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Desactivar', severity: 'warn' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.deactivate(tarea.id), `Tarea «${tarea.nombre}» desactivada.`),
    });
  }

  protected confirmRemove(tarea: Tarea): void {
    this.confirmation.confirm({
      header: 'Eliminar tarea',
      message: `¿Eliminar definitivamente la tarea «${tarea.nombre}»? Esta acción es irreversible.`,
      icon: 'pi pi-trash',
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.remove(tarea.id), `Tarea «${tarea.nombre}» eliminada.`),
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
