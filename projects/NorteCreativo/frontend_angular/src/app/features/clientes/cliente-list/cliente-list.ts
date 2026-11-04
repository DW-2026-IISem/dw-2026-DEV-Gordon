import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { Cliente, ClientePayload } from '../../../core/models/cliente';
import { SessionStore } from '../../../core/services/session-store';
import { NotificationService } from '../../../core/services/notification';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';
import { HasPermission } from '../../../shared/directives/has-permission';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { ClienteForm } from '../cliente-form/cliente-form';
import { ClienteApi } from '../cliente-api';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  imports: [
    TooltipModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    MessageModule,
    PageHeader,
    EmptyState,
    StatusTag,
    HasPermission,
    ClienteForm,
  ],
  selector: 'app-cliente-list',
  styleUrl: './cliente-list.css',
  templateUrl: './cliente-list.html',
})
export class ClienteList implements OnInit {
  private readonly api = inject(ClienteApi);
  private readonly session = inject(SessionStore);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly rows = signal<Cliente[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  // Error de la carga (persistente en la página) y error de la operación (dentro del diálogo).
  protected readonly error = signal<string | null>(null);
  protected readonly dialogError = signal<string | null>(null);
  protected readonly filter = signal('');
  protected readonly dialogVisible = signal(false);
  protected readonly editing = signal<Cliente | null>(null);
  protected readonly resetKey = signal(0);

  protected readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (c) => [
      c.nombre,
      c.numero_documento,
      c.email,
      c.telefono,
    ]),
  );
  // Sin ninguna acción permitida, la columna «Acciones» no se muestra.
  protected readonly hasActions = computed(() =>
    this.session.canAny([
      'PATCH /api/clientes/:id',
      'PATCH /api/clientes/:id/deactivate',
      'DELETE /api/clientes/:id',
    ]),
  );
  protected readonly title = computed(() => (this.editing() ? 'Editar cliente' : 'Nuevo cliente'));

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (clientes) => {
          this.rows.set(clientes);
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

  protected openEdit(cliente: Cliente): void {
    this.editing.set(cliente);
    this.openDialog();
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
  }

  // Crear usa POST; editar usa PATCH sin status (el payload no lo lleva).
  protected save(payload: ClientePayload): void {
    const editing = this.editing();
    const request = editing ? this.api.update(editing.id, payload) : this.api.create(payload);

    this.saving.set(true);
    this.dialogError.set(null);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (cliente) => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(
          editing
            ? `Cliente «${cliente.nombre}» actualizado.`
            : `Cliente «${cliente.nombre}» creado.`,
        );
        this.load();
      },
      error: (err: unknown) => {
        // El diálogo sigue abierto: el usuario corrige y vuelve a intentar.
        const message = toApiMessage(err);
        this.saving.set(false);
        this.dialogError.set(message);
        this.notify.error(message);
      },
    });
  }

  protected confirmDeactivate(cliente: Cliente): void {
    this.confirmation.confirm({
      header: 'Desactivar cliente',
      message: `¿Desactivar a «${cliente.nombre}»? Dejará de aparecer en la lista.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Desactivar', severity: 'warn' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () =>
        this.run(this.api.deactivate(cliente.id), `Cliente «${cliente.nombre}» desactivado.`),
    });
  }

  protected confirmRemove(cliente: Cliente): void {
    this.confirmation.confirm({
      header: 'Eliminar cliente',
      message: `¿Eliminar definitivamente a «${cliente.nombre}»? Esta acción es irreversible.`,
      icon: 'pi pi-trash',
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.remove(cliente.id), `Cliente «${cliente.nombre}» eliminado.`),
    });
  }

  private openDialog(): void {
    this.dialogError.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  // Baja lógica o física: avisa con un toast y recarga la lista.
  private run(request: import('rxjs').Observable<unknown>, success: string): void {
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notify.success(success);
        this.load();
      },
      error: (err: unknown) => this.notify.error(toApiMessage(err)),
    });
  }
}
