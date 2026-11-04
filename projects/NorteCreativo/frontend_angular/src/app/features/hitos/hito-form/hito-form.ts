import { Component, computed, effect, inject, input, output, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Campania } from '../../../core/models/campania';
import { Hito, HitoPayload } from '../../../core/models/hito';

type CampoHito = 'campania_id' | 'nombre' | 'descripcion';

// Sin campo estado ni fecha_cierre: el hito nace ABIERTO y lo cierra una aprobación.
@Component({
  imports: [ReactiveFormsModule, InputTextModule, SelectModule, TextareaModule, MessageModule, ButtonModule],
  selector: 'app-hito-form',
  styleUrl: './hito-form.css',
  templateUrl: './hito-form.html',
})
export class HitoForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly hito = input<Hito | null>(null);
  readonly campanias = input<Campania[]>([]);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<HitoPayload>();
  readonly cancelled = output<void>();

  // Un hito solo se abre en una campaña activa.
  protected readonly campaniasActivas = computed(() => this.campanias().filter((c) => c.status === 'active'));

  protected readonly form = this.fb.group({
    campania_id: this.fb.control<number | null>(null, Validators.required),
    nombre: this.fb.control('', [Validators.required, Validators.maxLength(120)]),
    descripcion: this.fb.control(''),
  });

  constructor() {
    effect(() => {
      const hito = this.hito();
      this.resetKey();
      untracked(() => {
        this.form.reset({
          campania_id: hito?.campania_id ?? null,
          nombre: hito?.nombre ?? '',
          descripcion: hito?.descripcion ?? '',
        });
      });
    });
  }

  protected invalid(name: CampoHito, error?: string): boolean {
    const control = this.form.controls[name];
    return control.touched && (error ? control.hasError(error) : control.invalid);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (value.campania_id === null) return;
    this.saved.emit({
      campania_id: value.campania_id,
      nombre: value.nombre.trim(),
      descripcion: value.descripcion.trim() || null,
    });
  }
}
