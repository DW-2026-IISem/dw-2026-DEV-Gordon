import { InferAttributes } from 'sequelize';
import { RefreshToken } from '../refresh-token.model';

// La respuesta nunca incluye token_hash (ni, por supuesto, el token en claro, que no existe en la base).
export type RefreshTokenResponseDto = Omit<InferAttributes<RefreshToken>, 'token_hash'> & { is_expired: boolean };

export const toRefreshTokenResponse = (token: RefreshToken): RefreshTokenResponseDto => {
  const { token_hash: _hash, ...seguro } = token.toJSON() as InferAttributes<RefreshToken>;
  return { ...seguro, is_expired: new Date(seguro.expires_at).getTime() <= Date.now() };
};
