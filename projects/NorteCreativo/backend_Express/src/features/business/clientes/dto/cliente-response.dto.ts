import { InferAttributes } from 'sequelize';
import { Cliente } from '../cliente.model';

export type ClienteResponseDto = InferAttributes<Cliente>;

export const toClienteResponse = (cliente: Cliente): ClienteResponseDto => cliente.toJSON();
