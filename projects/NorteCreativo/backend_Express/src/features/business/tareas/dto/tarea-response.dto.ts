import { InferAttributes } from 'sequelize';
import { HitoResponseDto } from '../../hitos/dto';
import { Tarea } from '../tarea.model';

export type TareaResponseDto = InferAttributes<Tarea> & { hito?: HitoResponseDto };

export const toTareaResponse = (tarea: Tarea): TareaResponseDto => tarea.toJSON();
