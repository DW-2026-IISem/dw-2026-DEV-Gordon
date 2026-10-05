import { InferAttributes } from 'sequelize';
import { TareaResponseDto } from '../../tareas/dto';
import { Entregable } from '../entregable.model';

export type EntregableResponseDto = InferAttributes<Entregable> & { tarea?: TareaResponseDto };

export const toEntregableResponse = (entregable: Entregable): EntregableResponseDto => entregable.toJSON();
