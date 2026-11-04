import { Component, effect, inject, input, output, untracked } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { HttpMethod } from '../../../../core/models/api';
import { Recurso, RecursoPayload } from '../../../../core/models/recurso';

const METODOS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

// El path de un recurso protegido siempre empieza por /api/.
export const apiPath = (control: AbstractControl<string>): ValidationErrors | null =>
  control.value && !control.value.trim().startsWith('/api/') ? { apiPath: true } : null;

@Component({
  imports: [ReactiveFormsModule, InputTextModule, SelectModule, MessageModule, ButtonModule],
  selector: 'app-recurso-form',
  styleUrl: './recurso-form.css',
  templateUrl: './recurso-form.html',
})
export class RecursoForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly recurso = input<Recurso | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<RecursoPayload>();
  readonly cancelled = output<void>();

  protected readonly metodos = METODOS.map((method) => ({ label: method, value: method }));

  protected readonly form = this.fb.group({
    method: this.fb.control<HttpMethod>('GET', Validators.required),
    path: this.fb.control('', [Validators.required, apiPath]),
    description: this.fb.control('', Validators.maxLength(255)),
  });

  constructor() {
    effect(() => {
      const recurso = this.recurso();
      this.resetKey();
      untracked(() =>
        this.form.reset({ method: recurso?.method ?? 'GET', path: recurso?.path ?? '', description: recurso?.description ?? '' }),
      );
    });
  }

  protected invalid(name: 'method' | 'path' | 'description', error?: string): boolean {
    const control = this.form.controls[name];
    return control.touched && (error ? control.hasError(error) : control.invalid);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saved.emit({ method: value.method, path: value.path.trim(), description: value.description.trim() || null });
  }
}
