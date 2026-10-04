import { InferAttributes } from 'sequelize';
import { ClienteResponseDto } from '../../clientes/dto';
import { Campania } from '../campania.model';

export type CampaniaResponseDto = InferAttributes<Campania> & { cliente?: ClienteResponseDto };

export const toCampaniaResponse = (campania: Campania): CampaniaResponseDto => campania.toJSON();
