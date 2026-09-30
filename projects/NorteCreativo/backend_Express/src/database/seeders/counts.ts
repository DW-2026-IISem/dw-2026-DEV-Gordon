export interface SeedCounts {
  clientes: number;
  campanias: number;
}

const DEFAULTS: SeedCounts = {
  clientes: 10,
  campanias: 15,
};

const parseCount = (raw: string | undefined, origen: string): number | undefined => {
  if (raw === undefined || raw === '') return undefined;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${origen} debe ser un entero mayor o igual a 0 (recibido: ${raw})`);
  }
  return value;
};

const getCliArg = (argv: string[], name: string): string | undefined =>
  argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];

// Prioridad: argumento CLI (--clientes=N) > variable de entorno (SEED_CLIENTES) > valor por defecto.
export const getSeedCounts = (argv: string[] = process.argv.slice(2)): SeedCounts => ({
  clientes:
    parseCount(getCliArg(argv, 'clientes'), '--clientes') ??
    parseCount(process.env.SEED_CLIENTES, 'SEED_CLIENTES') ??
    DEFAULTS.clientes,
  campanias:
    parseCount(getCliArg(argv, 'campanias'), '--campanias') ??
    parseCount(process.env.SEED_CAMPANIAS, 'SEED_CAMPANIAS') ??
    DEFAULTS.campanias,
});
