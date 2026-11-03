import { InferAttributes } from 'sequelize';
import { FacturaHito } from '../factura-hito.model';
import { Factura } from '../factura.model';

export type FacturaHitoResponseDto = InferAttributes<FacturaHito>;
export type FacturaResponseDto = InferAttributes<Factura> & { hitos?: FacturaHitoResponseDto[] };

// Respuesta de FacturarHitos (POST /api/facturas).
export interface FacturarHitosResponseDto {
  factura: FacturaResponseDto;
  hitos: { hito_id: number; valor: number }[];
  presupuesto_aprobado: number;
  total_facturado_campania: number;
}

export const toFacturaResponse = (factura: Factura): FacturaResponseDto => factura.toJSON();
