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
import { Campania, CampaniaPayload } from '../../../core/models/campania';
import { Cliente } from '../../../core/models/cliente';
import { NotificationService } from '../../../core/services/notification';
import { SessionStore } from '../../../core/services/session-store';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';
import { HasPermission } from '../../../shared/directives/has-permission';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { ClienteApi } from '../../clientes/cliente-api';
import { CampaniaApi } from '../campania-api';
import { CampaniaForm } from '../campania-form/campania-form';

interface ClienteOption {
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
    CampaniaForm,
  ],
  selector: 'app-campania-list',
  styleUrl: './campania-list.css',
  templateUrl: './campania-list.html',
})
export class CampaniaList implements OnInit {
  private readonly api = inject(CampaniaApi);
  private readonly clienteApi = inject(ClienteApi);
  private readonly session = inject(SessionStore);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly rows = signal<Campania[]>([]);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  // Error de la carga (persistente en la página) y error de la operación (dentro del diálogo).
  protected readonly error = signal<string | null>(null);
  protected readonly dialogError = signal<string | null>(null);
  protected readonly filter = signal('');
  protected readonly clienteFilter = signal<number | null>(null);
  protected readonly dialogVisible = signal(false);
  protected readonly editing = signal<Campania | null>(null);
  protected readonly resetKey = signal(0);

  // Map id -> nombre: se arma una sola vez y da la columna "Cliente".
  protected readonly clientesPorId = computed(() => new Map(this.clientes().map((c) => [c.id, c.nombre])));
  protected readonly clienteOptions = computed<ClienteOption[]>(() => [
    { id: null, nombre: 'Todos los clientes' },
    ...this.clientes().map((c) => ({ id: c.id, nombre: c.nombre })),
  ]);

  // El filtro por cliente y el buscador se combinan.
  protected readonly visibleRows = computed(() => {
    const clienteId = this.clienteFilter();
    const delCliente = clienteId === null ? this.rows() : this.rows().filter((c) => c.cliente_id === clienteId);
    const nombres = this.clientesPorId();
    return filterRows(delCliente, this.filter(), (c) => [c.nombre, c.descripcion, nombres.get(c.cliente_id)]);
  });
  // Sin ninguna acción permitida, la columna «Acciones» no se muestra.
  protected readonly hasActions = computed(() => this.session.canAny(['GET /api/hitos', 'PATCH /api/campanias/:id', 'PATCH /api/campanias/:id/deactivate', 'DELETE /api/campanias/:id']));
  protected readonly title = computed(() => (this.editing() ? 'Editar campaña' : 'Nueva campaña'));

  ngOnInit(): void {
    this.load();
  }

  protected clienteNombre(id: number): string {
    return this.clientesPorId().get(id) ?? `Cliente #${id}`;
  }

  // Campañas y clientes se piden en paralelo. Sin permiso de leer clientes, no se pide y la lista queda vacía.
  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    const clientes$: Observable<Cliente[]> = this.session.canPermission('GET /api/clientes')
      ? this.clienteApi.list()
      : of([]);

    forkJoin({ campanias: this.api.list(), clientes: clientes$ })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ campanias, clientes }) => {
          this.rows.set(campanias);
          this.clientes.set(clientes);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(toApiMessage(err));
          this.loading.set(false);
        },
      });
  }

  // Abre /hitos ya filtrado por esta campaña.
  protected verHitos(campania: Campania): void {
    void this.router.navigate(['/hitos'], { queryParams: { campania: campania.id } });
  }

  protected onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  protected openNew(): void {
    this.editing.set(null);
    this.openDialog();
  }

  protected openEdit(campania: Campania): void {
    this.editing.set(campania);
    this.openDialog();
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
  }

  // Crear usa POST; editar usa PATCH sin status (el payload no lo lleva).
  protected save(payload: CampaniaPayload): void {
    const editing = this.editing();
    const request = editing ? this.api.update(editing.id, payload) : this.api.create(payload);

    this.saving.set(true);
    this.dialogError.set(null);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (campania) => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(editing ? `Campaña «${campania.nombre}» actualizada.` : `Campaña «${campania.nombre}» creada.`);
        this.load();
      },
      error: (err: unknown) => {
        // 409 (cliente inactivo) o 404 (cliente inexistente): el diálogo sigue abierto.
        const message = toApiMessage(err);
        this.saving.set(false);
        this.dialogError.set(message);
        this.notify.error(message);
      },
    });
  }

  protected confirmDeactivate(campania: Campania): void {
    this.confirmation.confirm({
      header: 'Desactivar campaña',
      message: `¿Desactivar la campaña «${campania.nombre}»? Dejará de aparecer en la lista.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Desactivar', severity: 'warn' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.deactivate(campania.id), `Campaña «${campania.nombre}» desactivada.`),
    });
  }

  protected confirmRemove(campania: Campania): void {
    this.confirmation.confirm({
      header: 'Eliminar campaña',
      message: `¿Eliminar definitivamente la campaña «${campania.nombre}»? Esta acción es irreversible.`,
      icon: 'pi pi-trash',
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.remove(campania.id), `Campaña «${campania.nombre}» eliminada.`),
    });
  }

  private openDialog(): void {
    this.dialogError.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  // Baja lógica o física: avisa con un toast y recarga la lista.
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
