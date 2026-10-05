import { InferAttributes } from 'sequelize';
import { VersionEntregableResponseDto } from '../../version-entregables/dto';
import { Aprobacion } from '../aprobacion.model';

export type AprobacionResponseDto = InferAttributes<Aprobacion> & { version?: VersionEntregableResponseDto };

// Respuesta de CerrarHito (POST /api/aprobaciones).
export interface CerrarHitoResponseDto {
  aprobacion: AprobacionResponseDto;
  hito_cerrado: boolean;
  hito_id: number;
  fecha_cierre: Date | null;
}

export const toAprobacionResponse = (aprobacion: Aprobacion): AprobacionResponseDto => aprobacion.toJSON();
