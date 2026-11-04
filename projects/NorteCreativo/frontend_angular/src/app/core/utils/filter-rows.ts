// Sin mayúsculas ni tildes: "Acción" coincide con "accion".
const normalize = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

// PrimeNG 22 quitó el filtro global de p-table: se filtra el arreglo y se entrega a [value].
export function filterRows<T>(rows: readonly T[], term: string, fields: (row: T) => readonly unknown[]): T[] {
  const needle = normalize(term);
  if (!needle) return [...rows];
  return rows.filter((row) => fields(row).some((field) => normalize(field).includes(needle)));
}
