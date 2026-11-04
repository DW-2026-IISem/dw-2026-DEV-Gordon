import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth';
import { toApiMessage } from '../../../core/utils/api-error';

// Solo se acepta una ruta interna como destino: nada de //otro-sitio ni de URLs absolutas.
const safeReturnUrl = (value: string | undefined): string =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';

@Component({
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, MessageModule, PasswordModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // /login?returnUrl=%2Fclientes llega como input (withComponentInputBinding).
  readonly returnUrl = input<string | undefined>();

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    identifier: this.fb.control('', Validators.required),
    password: this.fb.control('', Validators.required),
  });

  protected invalid(name: 'identifier' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.touched && control.invalid;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { identifier, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(identifier.trim(), password).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigateByUrl(safeReturnUrl(this.returnUrl()));
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(toApiMessage(err));
      },
    });
  }
}
