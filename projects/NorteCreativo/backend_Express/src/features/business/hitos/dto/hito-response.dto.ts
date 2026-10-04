import { InferAttributes } from 'sequelize';
import { CampaniaResponseDto } from '../../campanias/dto';
import { Hito } from '../hito.model';

export type HitoResponseDto = InferAttributes<Hito> & { campania?: CampaniaResponseDto };

export const toHitoResponse = (hito: Hito): HitoResponseDto => hito.toJSON();
