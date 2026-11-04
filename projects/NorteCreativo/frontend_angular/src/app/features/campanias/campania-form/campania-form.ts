import { Component, computed, effect, inject, input, output, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Campania, CampaniaPayload } from '../../../core/models/campania';
import { Cliente } from '../../../core/models/cliente';

type CampoCampania = 'cliente_id' | 'nombre' | 'descripcion';

// Formulario sin llamadas a la API: valida y emite; la pantalla decide qué hacer.
@Component({
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    MessageModule,
    ButtonModule,
  ],
  selector: 'app-campania-form',
  styleUrl: './campania-form.css',
  templateUrl: './campania-form.html',
})
export class CampaniaForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly campania = input<Campania | null>(null);
  readonly clientes = input<Cliente[]>([]);
  // Cambia cada vez que se abre el diálogo: así "Nueva" vuelve a un formulario vacío.
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<CampaniaPayload>();
  readonly cancelled = output<void>();

  // Una campaña solo se abre para un cliente activo.
  protected readonly clientesActivos = computed(() =>
    this.clientes().filter((cliente) => cliente.status === 'active'),
  );

  protected readonly form = this.fb.group({
    cliente_id: this.fb.control<number | null>(null, Validators.required),
    nombre: this.fb.control('', [Validators.required, Validators.maxLength(120)]),
    descripcion: this.fb.control(''),
  });

  constructor() {
    effect(() => {
      const campania = this.campania();
      this.resetKey();
      untracked(() => {
        this.form.reset({
          cliente_id: campania?.cliente_id ?? null,
          nombre: campania?.nombre ?? '',
          descripcion: campania?.descripcion ?? '',
        });
      });
    });
  }

  // El error se muestra solo después de tocar el campo (o de intentar guardar).
  protected invalid(name: CampoCampania, error?: string): boolean {
    const control = this.form.controls[name];
    return control.touched && (error ? control.hasError(error) : control.invalid);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (value.cliente_id === null) return;
    this.saved.emit({
      cliente_id: value.cliente_id,
      nombre: value.nombre.trim(),
      descripcion: value.descripcion.trim() || null,
    });
  }
}
