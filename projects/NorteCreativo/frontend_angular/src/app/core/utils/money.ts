import { Money, toNumber } from '../models/api';

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

// Los DECIMAL pueden llegar como texto: se convierten con toNumber antes de formatear.
export const formatCop = (value: Money | null | undefined): string => COP.format(toNumber(value));
