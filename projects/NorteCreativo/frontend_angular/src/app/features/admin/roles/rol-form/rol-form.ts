import { Component, effect, inject, input, output, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Rol, RolPayload } from '../../../../core/models/rol';

@Component({
  imports: [ReactiveFormsModule, InputTextModule, MessageModule, ButtonModule],
  selector: 'app-rol-form',
  styleUrl: './rol-form.css',
  templateUrl: './rol-form.html',
})
export class RolForm {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly rol = input<Rol | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<RolPayload>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(60)]),
    description: this.fb.control('', Validators.maxLength(255)),
  });

  constructor() {
    effect(() => {
      const rol = this.rol();
      this.resetKey();
      untracked(() =>
        this.form.reset({ name: rol?.name ?? '', description: rol?.description ?? '' }),
      );
    });
  }

  protected invalid(name: 'name' | 'description', error?: string): boolean {
    const control = this.form.controls[name];
    return control.touched && (error ? control.hasError(error) : control.invalid);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saved.emit({ name: value.name.trim(), description: value.description.trim() || null });
  }
}
