import { filterRows } from './filter-rows';

interface Fila {
  nombre: string;
  email: string | null;
}

const filas: Fila[] = [
  { nombre: 'Agencia Ñandú', email: 'contacto@nandu.co' },
  { nombre: 'Café Aurora', email: null },
  { nombre: 'Distribuidora Sol', email: 'ventas@sol.com' },
];

const campos = (f: Fila) => [f.nombre, f.email];

describe('filterRows', () => {
  it('devuelve todo si el término está vacío', () => {
    expect(filterRows(filas, '   ', campos)).toHaveLength(3);
  });

  it('no distingue mayúsculas ni tildes', () => {
    expect(filterRows(filas, 'CAFE', campos).map((f) => f.nombre)).toEqual(['Café Aurora']);
    expect(filterRows(filas, 'nandu', campos).map((f) => f.nombre)).toEqual(['Agencia Ñandú']);
  });

  it('busca en cualquiera de los campos y tolera null', () => {
    expect(filterRows(filas, 'sol.com', campos).map((f) => f.nombre)).toEqual([
      'Distribuidora Sol',
    ]);
    expect(filterRows(filas, 'null', campos)).toHaveLength(0);
  });

  it('devuelve una copia y no modifica el arreglo original', () => {
    const resultado = filterRows(filas, '', campos);
    expect(resultado).not.toBe(filas);
  });
});
