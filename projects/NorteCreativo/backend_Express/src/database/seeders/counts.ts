export interface SeedCounts {
  clientes: number;
}

const DEFAULTS: SeedCounts = {
  clientes: 10,
};

const parseCount = (raw: string | undefined, origen: string): number | undefined => {
  if (raw === undefined || raw === '') return undefined;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${origen} debe ser un entero mayor o igual a 0 (recibido: ${raw})`);
  }
  return value;
};

// Prioridad: argumento CLI (--clientes=N) > variable de entorno (SEED_CLIENTES) > valor por defecto.
export const getSeedCounts = (argv: string[] = process.argv.slice(2)): SeedCounts => {
  const cliArg = argv.find((arg) => arg.startsWith('--clientes='))?.split('=')[1];
  return {
    clientes:
      parseCount(cliArg, '--clientes') ??
      parseCount(process.env.SEED_CLIENTES, 'SEED_CLIENTES') ??
      DEFAULTS.clientes,
  };
};
