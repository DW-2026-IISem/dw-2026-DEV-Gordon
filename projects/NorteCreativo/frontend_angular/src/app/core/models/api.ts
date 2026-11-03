// Los DECIMAL de MySQL pueden llegar como número o como texto.
export type Money = number | string;
export type Status = 'active' | 'inactive';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export const toNumber = (value: Money | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
