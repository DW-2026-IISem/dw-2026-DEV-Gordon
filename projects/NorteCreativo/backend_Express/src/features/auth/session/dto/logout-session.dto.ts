import { pickFields } from '../../../../shared/http/pick-fields';

export interface LogoutSessionDto {
  refresh_token: string;
}

export const toLogoutSessionDto = (body: unknown): LogoutSessionDto =>
  pickFields(body, ['refresh_token'] as const) as unknown as LogoutSessionDto;
