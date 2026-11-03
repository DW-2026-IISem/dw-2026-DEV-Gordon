import { InferAttributes } from 'sequelize';
import { CampaniaResponseDto } from '../../campanias/dto';
import { Presupuesto } from '../presupuesto.model';

export type PresupuestoResponseDto = InferAttributes<Presupuesto> & { campania?: CampaniaResponseDto };

export const toPresupuestoResponse = (presupuesto: Presupuesto): PresupuestoResponseDto => presupuesto.toJSON();
