import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { Rol, RolPayload } from '../../../../core/models/rol';
import { SessionStore } from '../../../../core/services/session-store';
import { NotificationService } from '../../../../core/services/notification';
import { toApiMessage } from '../../../../core/utils/api-error';
import { filterRows } from '../../../../core/utils/filter-rows';
import { HasPermission } from '../../../../shared/directives/has-permission';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';
import { RolApi } from '../../../roles/rol-api';
import { RolForm } from '../rol-form/rol-form';
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
    RolForm,
  ],
  selector: 'app-rol-list',
  styleUrl: './rol-list.css',
  templateUrl: './rol-list.html',
})
export class RolList implements OnInit {
  private readonly api = inject(RolApi);
  private readonly session = inject(SessionStore);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly rows = signal<Rol[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly dialogError = signal<string | null>(null);
  protected readonly filter = signal('');
  protected readonly dialogVisible = signal(false);
  protected readonly editing = signal<Rol | null>(null);
  protected readonly resetKey = signal(0);

  protected readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (r) => [r.name, r.description]),
  );
  protected readonly hasActions = computed(() =>
    this.session.canAny([
      'PATCH /api/roles/:id',
      'PATCH /api/roles/:id/deactivate',
      'DELETE /api/roles/:id',
    ]),
  );
  protected readonly title = computed(() => (this.editing() ? 'Editar rol' : 'Nuevo rol'));

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
        next: (rows) => {
          this.rows.set(rows);
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

  protected openEdit(row: Rol): void {
    this.editing.set(row);
    this.openDialog();
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
  }

  // Crear usa POST; editar usa PATCH.
  protected save(payload: RolPayload): void {
    const editing = this.editing();
    const request = editing
      ? this.api.update(editing.id, payload as RolPayload)
      : this.api.create(payload as RolPayload);

    this.saving.set(true);
    this.dialogError.set(null);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (row) => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(
          editing ? `Rol «${row.name}» actualizado.` : `Rol «${row.name}» creado.`,
        );
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

  protected confirmDeactivate(row: Rol): void {
    this.confirmation.confirm({
      header: 'Desactivar rol',
      message: `¿Desactivar «${row.name}»? Dejará de aparecer en la lista.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Desactivar', severity: 'warn' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.deactivate(row.id), `Rol «${row.name}» desactivado.`),
    });
  }

  protected confirmRemove(row: Rol): void {
    this.confirmation.confirm({
      header: 'Eliminar rol',
      message: `¿Eliminar definitivamente «${row.name}»? Esta acción es irreversible.`,
      icon: 'pi pi-trash',
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.remove(row.id), `Rol «${row.name}» eliminado.`),
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
