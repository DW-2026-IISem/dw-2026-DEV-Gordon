import { pickFields } from '../../../../shared/http/pick-fields';

export interface RefreshSessionDto {
  refresh_token: string;
}

export const toRefreshSessionDto = (body: unknown): RefreshSessionDto =>
  pickFields(body, ['refresh_token'] as const) as unknown as RefreshSessionDto;
