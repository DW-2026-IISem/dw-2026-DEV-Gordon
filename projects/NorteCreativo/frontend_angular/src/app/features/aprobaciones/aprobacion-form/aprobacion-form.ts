import { Component, computed, DestroyRef, effect, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { Aprobacion } from '../../../core/models/aprobacion';
import { VersionEntregable } from '../../../core/models/version-entregable';
import { NotificationService } from '../../../core/services/notification';
import { toApiMessage } from '../../../core/utils/api-error';
import { formatCop } from '../../../core/utils/money';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { VersionEntregableApi } from '../../versiones/version-entregable-api';
import { AprobacionApi } from '../aprobacion-api';

type Veredicto = Extract<Aprobacion['estado'], 'APROBADA' | 'RECHAZADA'>;

// Formulario transaccional en tres bloques con signals; un solo POST y luego vuelve al historial.
@Component({
  imports: [FormsModule, ButtonModule, MessageModule, SelectModule, SelectButtonModule, TextareaModule, PageHeader],
  selector: 'app-aprobacion-form',
  styleUrl: './aprobacion-form.css',
  templateUrl: './aprobacion-form.html',
})
export class AprobacionForm implements OnInit {
  private readonly api = inject(AprobacionApi);
  private readonly versionApi = inject(VersionEntregableApi);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // /aprobaciones/nueva?version=<id> preselecciona la versión.
  readonly version = input<string | undefined>();

  protected readonly versiones = signal<VersionEntregable[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitted = signal(false);

  protected readonly versionId = signal<number | null>(null);
  protected readonly estado = signal<Veredicto>('APROBADA');
  protected readonly comentario = signal('');

  protected readonly veredictos: { label: string; value: Veredicto }[] = [
    { label: 'Aprobar', value: 'APROBADA' },
    { label: 'Rechazar', value: 'RECHAZADA' },
  ];

  // Bloque 1: solo versiones EN_REVISION, con etiqueta que no depende de tareas.
  protected readonly opciones = computed(() =>
    this.versiones()
      .filter((v) => v.estado === 'EN_REVISION')
      .map((v) => ({ id: v.id, etiqueta: this.etiqueta(v) })),
  );

  protected readonly seleccionada = computed(() => this.opciones().find((o) => o.id === this.versionId()) ?? null);
  protected readonly versionInvalida = computed(() => this.submitted() && this.versionId() === null);
  // La UI exige comentario si se rechaza; el backend no lo exige.
  protected readonly comentarioInvalido = computed(
    () => this.submitted() && this.estado() === 'RECHAZADA' && this.comentario().trim() === '',
  );

  constructor() {
    effect(() => {
      const id = Number(this.version());
      const disponibles = this.opciones();
      if (Number.isInteger(id) && id > 0 && this.versionId() === null && disponibles.some((o) => o.id === id)) {
        this.versionId.set(id);
      }
    });
  }

  ngOnInit(): void {
    this.versionApi
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (versiones) => {
          this.versiones.set(versiones);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(toApiMessage(err));
          this.loading.set(false);
        },
      });
  }

  private etiqueta(v: VersionEntregable): string {
    return `Entregable #${v.entregable_id} · v${v.numero_version} · ${v.total === null ? 'sin total' : formatCop(v.total)}`;
  }

  protected cancelar(): void {
    void this.router.navigate(['/aprobaciones']);
  }

  // Un solo POST con { version_entregable_id, estado, comentario }; nunca aprobador_id (RN-05).
  protected enviar(): void {
    this.submitted.set(true);
    const versionId = this.versionId();
    if (versionId === null || this.comentarioInvalido()) return;

    this.saving.set(true);
    this.error.set(null);
    this.api
      .create({
        version_entregable_id: versionId,
        estado: this.estado(),
        comentario: this.comentario().trim() || null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          if (res.hito_cerrado) {
            const fecha = res.fecha_cierre ? new Date(res.fecha_cierre).toLocaleDateString('es-CO') : '';
            this.notify.success(`El hito #${res.hito_id} quedó cerrado${fecha ? ` el ${fecha}` : ''}.`, 'Hito cerrado');
          } else {
            this.notify.success(
              res.aprobacion.estado === 'APROBADA' ? 'Versión aprobada.' : 'Versión rechazada.',
              'Veredicto registrado',
            );
          }
          void this.router.navigate(['/aprobaciones']);
        },
        error: (err: unknown) => {
          this.saving.set(false);
          const base = toApiMessage(err);
          // 401: el aprobador sale de la sesión (RN-05) y el login llega en el ISS-08.
          const message =
            err instanceof HttpErrorResponse && err.status === 401
              ? `${base.replace(/\.?$/, '.')} Registrar un veredicto requiere una sesión de CLIENTE_APROBADOR (RN-05); el inicio de sesión llega en el ISS-08.`
              : base;
          this.error.set(message);
          this.notify.error(message);
        },
      });
  }
}
