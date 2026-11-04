import { Component, computed, effect, inject, input, output, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Hito } from '../../../core/models/hito';
import { Tarea, TareaPayload } from '../../../core/models/tarea';

type CampoTarea = 'hito_id' | 'nombre' | 'descripcion';

@Component({
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    MessageModule,
    ButtonModule,
  ],
  selector: 'app-tarea-form',
  styleUrl: './tarea-form.css',
  templateUrl: './tarea-form.html',
})
export class TareaForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly tarea = input<Tarea | null>(null);
  readonly hitos = input<Hito[]>([]);
  // id de campaña -> nombre, para la etiqueta «Campaña · Hito».
  readonly campaniasPorId = input<ReadonlyMap<number, string>>(new Map());
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<TareaPayload>();
  readonly cancelled = output<void>();

  protected readonly hitosActivos = computed(() =>
    this.hitos()
      .filter((h) => h.status === 'active')
      .map((h) => ({
        id: h.id,
        etiqueta: `${this.campaniasPorId().get(h.campania_id) ?? `Campaña #${h.campania_id}`} · ${h.nombre}`,
      })),
  );

  protected readonly form = this.fb.group({
    hito_id: this.fb.control<number | null>(null, Validators.required),
    nombre: this.fb.control('', [Validators.required, Validators.maxLength(120)]),
    descripcion: this.fb.control(''),
  });

  constructor() {
    effect(() => {
      const tarea = this.tarea();
      this.resetKey();
      untracked(() => {
        this.form.reset({
          hito_id: tarea?.hito_id ?? null,
          nombre: tarea?.nombre ?? '',
          descripcion: tarea?.descripcion ?? '',
        });
      });
    });
  }

  protected invalid(name: CampoTarea, error?: string): boolean {
    const control = this.form.controls[name];
    return control.touched && (error ? control.hasError(error) : control.invalid);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (value.hito_id === null) return;
    this.saved.emit({
      hito_id: value.hito_id,
      nombre: value.nombre.trim(),
      descripcion: value.descripcion.trim() || null,
    });
  }
}
