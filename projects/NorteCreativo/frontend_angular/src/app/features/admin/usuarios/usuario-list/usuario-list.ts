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
import { Usuario, UsuarioPatch, UsuarioPayload } from '../../../../core/models/usuario';
import { Permiso } from '../../../../core/models/auth';
import { SessionStore } from '../../../../core/services/session-store';
import { NotificationService } from '../../../../core/services/notification';
import { toApiMessage } from '../../../../core/utils/api-error';
import { filterRows } from '../../../../core/utils/filter-rows';
import { HasPermission } from '../../../../shared/directives/has-permission';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';
import { UsuarioApi } from '../../../usuarios/usuario-api';
import { UsuarioForm } from '../usuario-form/usuario-form';
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
    UsuarioForm,
  ],
  selector: 'app-usuario-list',
  styleUrl: './usuario-list.css',
  templateUrl: './usuario-list.html',
})
export class UsuarioList implements OnInit {
  private readonly api = inject(UsuarioApi);
  private readonly session = inject(SessionStore);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly rows = signal<Usuario[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly dialogError = signal<string | null>(null);
  protected readonly filter = signal('');
  protected readonly dialogVisible = signal(false);
  protected readonly editing = signal<Usuario | null>(null);
  protected readonly resetKey = signal(0);
  // «Ver permisos»: permisos efectivos del usuario elegido (GET /api/usuarios/:id/permisos).
  protected readonly permisosVisible = signal(false);
  protected readonly permisosUsuario = signal<Usuario | null>(null);
  protected readonly permisos = signal<Permiso[]>([]);
  protected readonly permisosLoading = signal(false);
  protected readonly permisosError = signal<string | null>(null);

  protected readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (r) => [r.username, r.email]),
  );
  protected readonly hasActions = computed(() =>
    this.session.canAny([
      'GET /api/usuarios/:id/permisos',
      'PATCH /api/usuarios/:id',
      'PATCH /api/usuarios/:id/deactivate',
      'DELETE /api/usuarios/:id',
    ]),
  );
  protected readonly title = computed(() => (this.editing() ? 'Editar usuario' : 'Nuevo usuario'));

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

  protected openEdit(row: Usuario): void {
    this.editing.set(row);
    this.openDialog();
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
  }

  // Crear usa POST; editar usa PATCH.
  protected save(payload: UsuarioPayload | UsuarioPatch): void {
    const editing = this.editing();
    const request = editing
      ? this.api.update(editing.id, payload as UsuarioPatch)
      : this.api.create(payload as UsuarioPayload);

    this.saving.set(true);
    this.dialogError.set(null);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (row) => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(
          editing ? `Usuario «${row.username}» actualizado.` : `Usuario «${row.username}» creado.`,
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

  // El propio usuario no puede desactivarse ni eliminarse desde la UI.
  protected isSelf(row: Usuario): boolean {
    return this.session.usuario()?.id === row.id;
  }

  protected confirmDeactivate(row: Usuario): void {
    this.confirmation.confirm({
      header: 'Desactivar usuario',
      message: `¿Desactivar «${row.username}»? Dejará de aparecer en la lista.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Desactivar', severity: 'warn' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.deactivate(row.id), `Usuario «${row.username}» desactivado.`),
    });
  }

  protected confirmRemove(row: Usuario): void {
    this.confirmation.confirm({
      header: 'Eliminar usuario',
      message: `¿Eliminar definitivamente «${row.username}»? Esta acción es irreversible.`,
      icon: 'pi pi-trash',
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () => this.run(this.api.remove(row.id), `Usuario «${row.username}» eliminado.`),
    });
  }

  protected verPermisos(row: Usuario): void {
    this.permisosUsuario.set(row);
    this.permisos.set([]);
    this.permisosError.set(null);
    this.permisosLoading.set(true);
    this.permisosVisible.set(true);
    this.api
      .permisos(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.permisos.set(res.permisos);
          this.permisosLoading.set(false);
        },
        error: (err: unknown) => {
          this.permisosError.set(toApiMessage(err));
          this.permisosLoading.set(false);
        },
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
