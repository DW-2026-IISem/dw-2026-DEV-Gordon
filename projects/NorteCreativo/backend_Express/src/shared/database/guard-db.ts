import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from 'sequelize';
import { AppError } from '../errors/app-error';

export interface DbErrorMessages {
  unique?: string;
  foreignKey?: string;
}

// Los repositories son la única capa que toca Sequelize: aquí traducen sus errores a AppError.
export async function guardDb<T>(work: () => Promise<T>, messages: DbErrorMessages = {}): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError(409, messages.unique ?? 'Registro duplicado');
    }
    if (error instanceof ForeignKeyConstraintError) {
      throw new AppError(409, messages.foreignKey ?? 'La operación viola una relación con otro registro');
    }
    if (error instanceof ValidationError) {
      throw new AppError(400, 'Error de validación', error.errors.map((e) => e.message));
    }
    throw error;
  }
}
