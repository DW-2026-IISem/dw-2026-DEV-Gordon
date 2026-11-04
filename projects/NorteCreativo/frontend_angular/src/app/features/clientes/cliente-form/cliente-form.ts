import { Component, effect, inject, input, output, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { Cliente, ClientePayload, TipoDocumento } from '../../../core/models/cliente';

type CampoCliente = 'tipo_documento' | 'numero_documento' | 'nombre' | 'telefono' | 'email';

const TIPOS: TipoDocumento[] = ['CC', 'NIT', 'CE', 'TI', 'PASAPORTE'];

// Formulario sin llamadas a la API: valida y emite; la pantalla decide qué hacer.
@Component({
  imports: [ReactiveFormsModule, InputTextModule, SelectModule, MessageModule, ButtonModule],
  selector: 'app-cliente-form',
  styleUrl: './cliente-form.css',
  templateUrl: './cliente-form.html',
})
export class ClienteForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly cliente = input<Cliente | null>(null);
  // Cambia cada vez que se abre el diálogo: así "Nuevo" vuelve a un formulario vacío.
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<ClientePayload>();
  readonly cancelled = output<void>();

  protected readonly tipos = TIPOS.map((tipo) => ({ label: tipo, value: tipo }));

  protected readonly form = this.fb.group({
    tipo_documento: this.fb.control<TipoDocumento>('CC', Validators.required),
    numero_documento: this.fb.control('', Validators.required),
    nombre: this.fb.control('', [Validators.required, Validators.maxLength(120)]),
    telefono: this.fb.control(''),
    email: this.fb.control('', [Validators.required, Validators.email]),
  });

  constructor() {
    effect(() => {
      const cliente = this.cliente();
      this.resetKey();
      untracked(() => {
        this.form.reset({
          tipo_documento: cliente?.tipo_documento ?? 'CC',
          numero_documento: cliente?.numero_documento ?? '',
          nombre: cliente?.nombre ?? '',
          telefono: cliente?.telefono ?? '',
          email: cliente?.email ?? '',
        });
      });
    });
  }

  // El error se muestra solo después de tocar el campo (o de intentar guardar).
  protected invalid(name: CampoCliente, error?: string): boolean {
    const control = this.form.controls[name];
    return control.touched && (error ? control.hasError(error) : control.invalid);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saved.emit({
      tipo_documento: value.tipo_documento,
      numero_documento: value.numero_documento.trim(),
      nombre: value.nombre.trim(),
      telefono: value.telefono.trim() || null,
      email: value.email.trim(),
    });
  }
}
