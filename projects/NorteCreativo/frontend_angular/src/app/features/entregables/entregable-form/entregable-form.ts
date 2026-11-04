import { Component, computed, effect, inject, input, output, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Hito } from '../../../core/models/hito';
import { Tarea } from '../../../core/models/tarea';
import { Entregable, EntregablePayload, EstadoEntregable } from '../../../core/models/entregable';
import { toNumber } from '../../../core/models/api';
import { rangoFechas, toDate, toIso } from '../../../core/utils/dates';

type CampoEntregable = 'tarea_id' | 'fecha_inicio' | 'fecha_fin' | 'total' | 'estado' | 'observaciones';

@Component({
  imports: [ReactiveFormsModule, SelectModule, DatePickerModule, InputNumberModule, TextareaModule, MessageModule, ButtonModule],
  selector: 'app-entregable-form',
  styleUrl: './entregable-form.css',
  templateUrl: './entregable-form.html',
})
export class EntregableForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly entregable = input<Entregable | null>(null);
  readonly tareas = input<Tarea[]>([]);
  readonly hitosPorId = input<ReadonlyMap<number, string>>(new Map());
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<EntregablePayload>();
  readonly cancelled = output<void>();

  protected readonly estados: { value: EstadoEntregable; label: string }[] = [
    { value: 'EN_PROCESO', label: 'En proceso' },
    { value: 'ENTREGADO', label: 'Entregado' },
  ];

  // Solo tareas activas, con la etiqueta «Hito · Tarea».
  protected readonly tareasActivas = computed(() =>
    this.tareas()
      .filter((t) => t.status === 'active')
      .map((t) => ({
        id: t.id,
        etiqueta: `${this.hitosPorId().get(t.hito_id) ?? `Hito #${t.hito_id}`} · ${t.nombre}`,
      })),
  );

  protected readonly form = this.fb.group(
    {
      tarea_id: this.fb.control<number | null>(null, Validators.required),
      fecha_inicio: this.fb.control<Date | null>(null),
      fecha_fin: this.fb.control<Date | null>(null),
      total: this.fb.control<number | null>(null, Validators.min(0)),
      estado: this.fb.control<EstadoEntregable>('EN_PROCESO'),
      observaciones: this.fb.control(''),
    },
    { validators: rangoFechas },
  );

  constructor() {
    effect(() => {
      const e = this.entregable();
      this.resetKey();
      untracked(() => {
        this.form.reset({
          tarea_id: e?.tarea_id ?? null,
          fecha_inicio: toDate(e?.fecha_inicio),
          fecha_fin: toDate(e?.fecha_fin),
          total: e?.total == null ? null : toNumber(e.total),
          estado: e?.estado ?? 'EN_PROCESO',
          observaciones: e?.observaciones ?? '',
        });
      });
    });
  }

  protected invalid(name: CampoEntregable, error?: string): boolean {
    const control = this.form.controls[name];
    return control.touched && (error ? control.hasError(error) : control.invalid);
  }

  protected get rangoInvalido(): boolean {
    return this.form.hasError('rangoFechas') && this.form.controls.fecha_fin.touched;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (v.tarea_id === null) return;
    this.saved.emit({
      tarea_id: v.tarea_id,
      fecha_inicio: toIso(v.fecha_inicio),
      fecha_fin: toIso(v.fecha_fin),
      total: v.total === null ? null : Number(v.total),
      estado: v.estado,
      observaciones: v.observaciones.trim() || null,
    });
  }
}
