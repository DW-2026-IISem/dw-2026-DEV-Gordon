import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ConcesionRol } from '../../../../core/models/concesion-rol';
import { Recurso } from '../../../../core/models/recurso';
import { ConcesionRolApi } from '../../../concesiones-rol/concesion-rol-api';
import { RolApi } from '../../../roles/rol-api';
import { RecursoApi } from '../../../recursos/recurso-api';
import { Rol } from '../../../../core/models/rol';
import { SessionStore } from '../../../../core/services/session-store';
import { NotificationService } from '../../../../core/services/notification';
import { toApiMessage } from '../../../../core/utils/api-error';
import { HasPermission } from '../../../../shared/directives/has-permission';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';
import { TooltipModule } from 'primeng/tooltip';

interface Opcion {
  label: string;
  value: number;
}

interface Fila extends ConcesionRol {
  recursoLabel: string;
  roleLabel: string;
}

@Component({
  imports: [
    TooltipModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    MessageModule,
    PageHeader,
    EmptyState,
    StatusTag,
    HasPermission,
  ],
  selector: 'app-concesion-list',
  styleUrl: './concesion-list.css',
  templateUrl: './concesion-list.html',
})
export class ConcesionList implements OnInit {
  private readonly api = inject(ConcesionRolApi);
  private readonly recursoApi = inject(RecursoApi);
  private readonly rolApi = inject(RolApi);
  private readonly session = inject(SessionStore);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly rows = signal<Fila[]>([]);
  protected readonly recursoOptions = signal<Opcion[]>([]);
  protected readonly roleOptions = signal<Opcion[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly dialogError = signal<string | null>(null);
  protected readonly dialogVisible = signal(false);
  protected readonly roleFilter = signal<number | null>(null);
  protected readonly newRecurso = signal<number | null>(null);
  protected readonly newRole = signal<number | null>(null);

  protected readonly canSave = computed(
    () => this.newRecurso() !== null && this.newRole() !== null,
  );
  protected readonly visibleRows = computed(() => {
    const filtro = this.roleFilter();
    return filtro === null ? this.rows() : this.rows().filter((row) => row.role_id === filtro);
  });
  protected readonly hasActions = computed(() =>
    this.session.canAny(['PATCH /api/concesiones-rol/:id/deactivate']),
  );

  ngOnInit(): void {
    this.load();
  }

  // Nombres con forkJoin + Map: las tablas puente solo traen ids.
  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ rows: this.api.list(), recursos: this.recursoApi.list(), roles: this.rolApi.list() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ rows, recursos, roles }) => {
          const recursoMap = new Map<number, string>(
            recursos.map((item) => [item.id, `${item.method} ${item.path}`]),
          );
          const roleMap = new Map<number, string>(roles.map((rol: Rol) => [rol.id, rol.name]));
          this.recursoOptions.set(
            recursos.map((item) => ({ label: `${item.method} ${item.path}`, value: item.id })),
          );
          this.roleOptions.set(roles.map((rol: Rol) => ({ label: rol.name, value: rol.id })));
          this.rows.set(
            rows.map((row) => ({
              ...row,
              recursoLabel: recursoMap.get(row.resource_id) ?? `#${row.resource_id}`,
              roleLabel: roleMap.get(row.role_id) ?? `#${row.role_id}`,
            })),
          );
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(toApiMessage(err));
          this.loading.set(false);
        },
      });
  }

  protected openNew(): void {
    this.newRecurso.set(null);
    this.newRole.set(null);
    this.dialogError.set(null);
    this.dialogVisible.set(true);
  }

  // POST también reactiva un vínculo retirado (el backend no duplica la fila).
  protected save(): void {
    if (!this.canSave()) return;
    this.saving.set(true);
    this.dialogError.set(null);
    this.api
      .create({ resource_id: this.newRecurso()!, role_id: this.newRole()! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.dialogVisible.set(false);
          this.notify.success('Concesión guardada (creada o reactivada).');
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

  protected confirmDeactivate(row: Fila): void {
    this.confirmation.confirm({
      header: 'Retirar concesión',
      message: `¿Retirar «${row.recursoLabel}» a «${row.roleLabel}»? Surte efecto en la siguiente petición del usuario.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Retirar', severity: 'warn' },
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      accept: () =>
        this.api
          .deactivate(row.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.notify.success('Concesión retirada.');
              this.load();
            },
            error: (err: unknown) => this.notify.error(toApiMessage(err)),
          }),
    });
  }
}
