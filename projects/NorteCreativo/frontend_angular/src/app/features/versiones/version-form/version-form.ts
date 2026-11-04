import { Component, effect, inject, input, output, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { toNumber } from '../../../core/models/api';
import { VersionEntregable, VersionEntregablePayload } from '../../../core/models/version-entregable';
import { rangoFechas, toDate, toIso } from '../../../core/utils/dates';

// Sin numero_version ni estado: los asigna el backend (siguiente número, EN_REVISION).
@Component({
  imports: [ReactiveFormsModule, DatePickerModule, InputNumberModule, TextareaModule, MessageModule, ButtonModule],
  selector: 'app-version-form',
  styleUrl: './version-form.css',
  templateUrl: './version-form.html',
})
export class VersionForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly version = input<VersionEntregable | null>(null);
  // El entregable va fijo: viene de la pantalla que abre el formulario.
  readonly entregableId = input.required<number>();
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<VersionEntregablePayload>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.group(
    {
      fecha_inicio: this.fb.control<Date | null>(null),
      fecha_fin: this.fb.control<Date | null>(null),
      total: this.fb.control<number | null>(null, Validators.min(0)),
      observaciones: this.fb.control(''),
    },
    { validators: rangoFechas },
  );

  constructor() {
    effect(() => {
      const v = this.version();
      this.resetKey();
      untracked(() => {
        this.form.reset({
          fecha_inicio: toDate(v?.fecha_inicio),
          fecha_fin: toDate(v?.fecha_fin),
          total: v?.total == null ? null : toNumber(v.total),
          observaciones: v?.observaciones ?? '',
        });
      });
    });
  }

  protected get rangoInvalido(): boolean {
    return this.form.hasError('rangoFechas') && this.form.controls.fecha_fin.touched;
  }

  protected get totalNegativo(): boolean {
    const c = this.form.controls.total;
    return c.touched && c.hasError('min');
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saved.emit({
      entregable_id: this.entregableId(),
      fecha_inicio: toIso(v.fecha_inicio),
      fecha_fin: toIso(v.fecha_fin),
      total: v.total === null ? null : Number(v.total),
      observaciones: v.observaciones.trim() || null,
    });
  }
}
