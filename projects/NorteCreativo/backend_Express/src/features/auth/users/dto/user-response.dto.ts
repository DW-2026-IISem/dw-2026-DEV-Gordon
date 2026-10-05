import { InferAttributes } from 'sequelize';
import { User } from '../user.model';

// La respuesta nunca incluye password (ni siquiera el hash).
export type UserResponseDto = Omit<InferAttributes<User>, 'password'>;

export const toUserResponse = (user: User): UserResponseDto => {
  const { password: _password, ...seguro } = user.toJSON();
  return seguro;
};
