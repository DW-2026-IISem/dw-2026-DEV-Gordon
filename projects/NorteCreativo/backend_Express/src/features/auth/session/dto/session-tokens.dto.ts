// Respuesta de login y refresh. El refresh token en claro se entrega aquí UNA sola vez.
export interface SessionTokensDto {
  access_token: string;
  token_type: 'Bearer';
  // segundos de vida del access token
  expires_in: number;
  refresh_token: string;
  // segundos de vida del refresh token
  refresh_expires_in: number;
}
