import { InferAttributes } from 'sequelize';
import { Resource } from '../resource.model';

export type ResourceResponseDto = InferAttributes<Resource>;

export const toResourceResponse = (resource: Resource): ResourceResponseDto => resource.toJSON();
