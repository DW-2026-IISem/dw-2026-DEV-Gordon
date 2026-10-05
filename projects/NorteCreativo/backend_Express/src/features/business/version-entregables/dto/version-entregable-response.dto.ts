import { InferAttributes } from 'sequelize';
import { EntregableResponseDto } from '../../entregables/dto';
import { VersionEntregable } from '../version-entregable.model';

export type VersionEntregableResponseDto = InferAttributes<VersionEntregable> & { entregable?: EntregableResponseDto };

export const toVersionEntregableResponse = (version: VersionEntregable): VersionEntregableResponseDto => version.toJSON();
