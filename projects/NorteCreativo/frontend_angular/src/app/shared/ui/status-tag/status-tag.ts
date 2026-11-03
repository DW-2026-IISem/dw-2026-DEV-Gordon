import { Component, computed, input } from '@angular/core';
import { TagModule } from 'primeng/tag';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

interface TagView {
  label: string;
  severity: Severity;
}

const VIEWS: Record<string, TagView> = {
  active: { label: 'Activo', severity: 'success' },
  inactive: { label: 'Inactivo', severity: 'secondary' },
  ABIERTO: { label: 'Abierto', severity: 'info' },
  CERRADO: { label: 'Cerrado', severity: 'warn' },
  FACTURADO: { label: 'Facturado', severity: 'success' },
  EN_PROCESO: { label: 'En proceso', severity: 'info' },
  ENTREGADO: { label: 'Entregado', severity: 'success' },
  EN_REVISION: { label: 'En revisión', severity: 'warn' },
  APROBADA: { label: 'Aprobada', severity: 'success' },
  RECHAZADA: { label: 'Rechazada', severity: 'danger' },
  PENDIENTE: { label: 'Pendiente', severity: 'warn' },
  EMITIDA: { label: 'Emitida', severity: 'success' },
};

// Recibe un status o un estado del dominio y lo pinta con su color; cambia cuando cambia el input.
@Component({
  imports: [TagModule],
  selector: 'app-status-tag',
  styleUrl: './status-tag.css',
  templateUrl: './status-tag.html',
})
export class StatusTag {
  readonly value = input.required<string>();

  protected readonly view = computed<TagView>(
    () => VIEWS[this.value()] ?? { label: this.value(), severity: 'secondary' },
  );
}
