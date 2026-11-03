import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

type EstadoEntregable = 'EN_PROCESO' | 'ENTREGADO';

interface EntregableDemo {
  nombre: string;
  total: number;
  estado: EstadoEntregable;
}

const INICIAL: EntregableDemo = { nombre: 'Video de lanzamiento 30 s', total: 1500000, estado: 'EN_PROCESO' };
const IVA = 0.19;
const PASO = 100000;

@Component({
  imports: [DecimalPipe, ButtonModule, TagModule],
  selector: 'app-ejemplo',
  styleUrl: './ejemplo.css',
  templateUrl: './ejemplo.html',
})
export class Ejemplo {
  protected readonly paso = PASO;
  protected readonly entregable = signal<EntregableDemo>({ ...INICIAL });
  protected readonly totalConIva = computed(() => Math.round(this.entregable().total * (1 + IVA)));

  constructor() {
    effect(() => {
      console.log('[ejemplo] cambió el entregable:', this.entregable(), '| total con IVA 19 %:', this.totalConIva());
    });
  }

  protected cambiarTotal(delta: number): void {
    this.entregable.update((e) => ({ ...e, total: Math.max(0, e.total + delta) }));
  }

  protected alternarEstado(): void {
    this.entregable.update((e) => ({ ...e, estado: e.estado === 'EN_PROCESO' ? 'ENTREGADO' : 'EN_PROCESO' }));
  }

  protected cambiarNombre(): void {
    this.entregable.update((e) => ({
      ...e,
      nombre: e.nombre === INICIAL.nombre ? 'Spot de radio 20 s' : INICIAL.nombre,
    }));
  }

  protected reiniciar(): void {
    this.entregable.set({ ...INICIAL });
  }
}
