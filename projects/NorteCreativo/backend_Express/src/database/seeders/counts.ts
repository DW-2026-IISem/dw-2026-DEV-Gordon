export interface SeedCounts {
  clientes: number;
  campanias: number;
  hitos: number;
  tareas: number;
  entregables: number;
}

const DEFAULTS: SeedCounts = {
  clientes: 10,
  campanias: 15,
  hitos: 20,
  tareas: 30,
  entregables: 40,
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
  hitos:
    parseCount(getCliArg(argv, 'hitos'), '--hitos') ??
    parseCount(process.env.SEED_HITOS, 'SEED_HITOS') ??
    DEFAULTS.hitos,
  tareas:
    parseCount(getCliArg(argv, 'tareas'), '--tareas') ??
    parseCount(process.env.SEED_TAREAS, 'SEED_TAREAS') ??
    DEFAULTS.tareas,
  entregables:
    parseCount(getCliArg(argv, 'entregables'), '--entregables') ??
    parseCount(process.env.SEED_ENTREGABLES, 'SEED_ENTREGABLES') ??
    DEFAULTS.entregables,
});
