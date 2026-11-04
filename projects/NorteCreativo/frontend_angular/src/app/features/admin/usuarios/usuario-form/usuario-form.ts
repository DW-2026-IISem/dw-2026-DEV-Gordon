import { Component, computed, effect, inject, input, output, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { Status } from '../../../../core/models/api';
import { Usuario, UsuarioPatch, UsuarioPayload } from '../../../../core/models/usuario';

type CampoUsuario = 'username' | 'email' | 'password';

// Formulario sin llamadas a la API. Crear: username, email, password y status. Editar: solo username y email.
@Component({
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    MessageModule,
    ButtonModule,
  ],
  selector: 'app-usuario-form',
  styleUrl: './usuario-form.css',
  templateUrl: './usuario-form.html',
})
export class UsuarioForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly usuario = input<Usuario | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<UsuarioPayload | UsuarioPatch>();
  readonly cancelled = output<void>();

  protected readonly estados = [
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
  ];

  protected readonly form = this.fb.group({
    username: this.fb.control('', [Validators.required, Validators.maxLength(60)]),
    email: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', [Validators.required, Validators.minLength(8)]),
    status: this.fb.control<Status>('active'),
  });

  constructor() {
    effect(() => {
      const usuario = this.usuario();
      this.resetKey();
      untracked(() => {
        this.form.reset({
          username: usuario?.username ?? '',
          email: usuario?.email ?? '',
          password: '',
          status: 'active',
        });
        // La contraseña solo existe al crear: al editar no se pide ni se valida.
        if (usuario) this.form.controls.password.disable();
        else this.form.controls.password.enable();
      });
    });
  }

  protected readonly editing = computed(() => this.usuario() !== null);

  protected invalid(name: CampoUsuario, error?: string): boolean {
    const control = this.form.controls[name];
    return control.touched && (error ? control.hasError(error) : control.invalid);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const base = { username: value.username.trim(), email: value.email.trim() };
    this.saved.emit(
      this.editing() ? base : { ...base, password: value.password, status: value.status },
    );
  }
}
