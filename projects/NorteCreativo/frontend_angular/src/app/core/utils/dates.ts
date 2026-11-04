import { AbstractControl, ValidationErrors } from '@angular/forms';

// El backend entrega fechas ISO; el DatePicker trabaja con Date.
export const toDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const toIso = (value: Date | null | undefined): string | null => (value ? value.toISOString() : null);

// Validador de grupo: fecha_fin no puede ser anterior a fecha_inicio.
export const rangoFechas = (group: AbstractControl): ValidationErrors | null => {
  const inicio = group.get('fecha_inicio')?.value as Date | null;
  const fin = group.get('fecha_fin')?.value as Date | null;
  return inicio && fin && fin < inicio ? { rangoFechas: true } : null;
};
