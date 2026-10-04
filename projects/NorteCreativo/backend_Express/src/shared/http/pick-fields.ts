export const pickFields = <K extends string>(body: unknown, campos: readonly K[]): Partial<Record<K, unknown>> => {
  const source = (body ?? {}) as Record<string, unknown>;
  const data: Partial<Record<K, unknown>> = {};
  for (const campo of campos) {
    if (source[campo] !== undefined) data[campo] = source[campo];
  }
  return data;
};
