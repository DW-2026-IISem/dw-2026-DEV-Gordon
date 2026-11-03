import { withTransaction } from '../../../shared/database/with-transaction';
import { AppError } from '../../../shared/errors/app-error';
import { CampaniasRepository } from '../campanias/campanias.repository';
import { EntregablesRepository } from '../entregables/entregables.repository';
import { HitosRepository } from '../hitos/hitos.repository';
import { PresupuestosRepository } from '../presupuestos/presupuestos.repository';
import { TareasRepository } from '../tareas/tareas.repository';
import { Hito } from '../hitos/hito.model';
import { CreateFacturaDto, FacturaResponseDto, FacturarHitosResponseDto, toFacturaResponse } from './dto';
import { calcularImportes, excedePresupuesto, redondear2 } from './facturacion.evaluator';
import { FacturasRepository, MSG_NUMERO_DUPLICADO } from './facturas.repository';

const TASA_IVA_POR_DEFECTO = 0.19;

// Tasa configurable por FACTURA_IVA (.env); sin valor se usa 0.19. Un valor inválido es un error de configuración.
export const tasaIva = (): number => {
  const raw = process.env.FACTURA_IVA;
  if (raw === undefined || raw.trim() === '') return TASA_IVA_POR_DEFECTO;
  const tasa = Number(raw);
  if (!Number.isFinite(tasa) || tasa < 0 || tasa > 1) {
    throw new AppError(500, 'Configuración inválida: FACTURA_IVA debe ser un número entre 0 y 1');
  }
  return tasa;
};

const MAX_INTENTOS = 10;

// Errores transitorios por concurrencia: colisión del consecutivo (RN-07) o deadlock del motor. Se reintenta la transacción.
const esReintentable = (error: unknown): boolean => {
  if (error instanceof AppError) return error.statusCode === 409 && error.message === MSG_NUMERO_DUPLICADO;
  const e = error as { parent?: { code?: string; number?: number }; original?: { code?: string } } | null;
  const codigo = e?.parent?.code ?? e?.original?.code;
  return codigo === 'ER_LOCK_DEADLOCK' || codigo === '40P01' || e?.parent?.number === 1205;
};

const entero = (valor: unknown): number | null =>
  typeof valor === 'number' && Number.isInteger(valor) && valor > 0 ? valor : null;

export class FacturasService {
  constructor(
    private readonly repository: FacturasRepository = new FacturasRepository(),
    private readonly campanias: CampaniasRepository = new CampaniasRepository(),
    private readonly presupuestos: PresupuestosRepository = new PresupuestosRepository(),
    private readonly hitos: HitosRepository = new HitosRepository(),
    private readonly tareas: TareasRepository = new TareasRepository(),
    private readonly entregables: EntregablesRepository = new EntregablesRepository()
  ) {}

  public async getAll(campaniaId?: unknown): Promise<FacturaResponseDto[]> {
    let filtro: number | undefined;
    if (campaniaId !== undefined) {
      const n = Number(campaniaId);
      if (typeof campaniaId !== 'string' || !/^\d+$/.test(campaniaId) || n < 1) {
        throw new AppError(400, 'Error de validación', ['campania_id debe ser un entero positivo']);
      }
      filtro = n;
    }
    return (await this.repository.findAllActive(filtro)).map(toFacturaResponse);
  }

  public async getOne(id: number): Promise<FacturaResponseDto> {
    const factura = await this.repository.findByIdWithHitos(id);
    if (!factura) throw new AppError(404, 'Factura no encontrada');
    return toFacturaResponse(factura);
  }

  private validar(body: CreateFacturaDto): { campaniaId: number; hitoIds: number[] } {
    const errores: string[] = [];
    const campaniaId = entero(body.campania_id);
    if (campaniaId === null) errores.push('campania_id es requerido y debe ser un entero positivo');

    let hitoIds: number[] = [];
    if (!Array.isArray(body.hito_ids) || body.hito_ids.length === 0) {
      errores.push('hito_ids es requerido y debe ser un arreglo con al menos un hito');
    } else if (body.hito_ids.some((h) => entero(h) === null)) {
      errores.push('hito_ids solo admite enteros positivos');
    } else if (new Set(body.hito_ids).size !== body.hito_ids.length) {
      errores.push('hito_ids no admite hitos repetidos');
    } else {
      hitoIds = [...body.hito_ids].sort((a, b) => a - b); // orden fijo de bloqueo: evita deadlocks entre facturaciones
    }
    if (errores.length > 0) throw new AppError(400, 'Error de validación', errores);
    return { campaniaId: campaniaId!, hitoIds };
  }

  // valor del hito = suma de entregables.total de sus tareas (consultas secuenciales: comparten la transacción).
  private async valorDelHito(hito: Hito, t: import('sequelize').Transaction): Promise<number> {
    let suma = 0;
    for (const tarea of await this.tareas.findByHito(hito.id, t)) {
      for (const e of await this.entregables.findByTarea(tarea.id, t)) suma += e.total ?? 0;
    }
    return redondear2(suma);
  }

  // FacturarHitos: valida, calcula, crea factura + factura_hitos y pasa los hitos a FACTURADO en UNA transacción.
  public async create(body: CreateFacturaDto): Promise<FacturarHitosResponseDto> {
    const { campaniaId, hitoIds } = this.validar(body);
    const tasa = tasaIva();

    for (let intento = 1; ; intento++) {
      try {
        return await this.facturar(campaniaId, hitoIds, tasa);
      } catch (error) {
        if (!esReintentable(error)) throw error;
        // Cada intento es una transacción nueva (la anterior ya hizo rollback completo). Agotados los intentos: 409.
        if (intento >= MAX_INTENTOS) throw new AppError(409, 'No se pudo asignar el número de factura por concurrencia; reintenta');
        await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 30 * intento) + 10));
      }
    }
  }

  private facturar(campaniaId: number, hitoIds: number[], tasa: number): Promise<FacturarHitosResponseDto> {
    return withTransaction(async (t) => {
      // 1) Campaña. El bloqueo de su fila serializa facturaciones simultáneas de la misma campaña (RN-03 sin carreras).
      const campania = await this.campanias.findByIdForUpdate(campaniaId, t);
      if (!campania) throw new AppError(404, 'Campaña no encontrada');
      if (campania.status === 'inactive') throw new AppError(409, 'No se factura una campaña inactiva');

      const aprobados = await this.presupuestos.findAprobadosDeCampania(campaniaId, t);
      if (aprobados.length === 0) throw new AppError(409, 'La campaña no tiene un presupuesto APROBADO');
      const presupuestoAprobado = redondear2(aprobados.reduce((acc, p) => acc + p.valor, 0));

      // 2) Hitos: existen (404), son de la campaña (400) y están CERRADOS (409). Bloqueados con LOCK.UPDATE.
      const lista: { hito: Hito; valor: number }[] = [];
      for (const id of hitoIds) {
        const hito = await this.hitos.findByIdForUpdate(id, t);
        if (!hito) throw new AppError(404, `Hito ${id} no encontrado`);
        if (hito.campania_id !== campaniaId) throw new AppError(400, `El hito ${id} no pertenece a la campaña ${campaniaId}`);
        if (hito.estado !== 'CERRADO') {
          throw new AppError(409, `El hito ${id} está ${hito.estado}: solo se facturan hitos CERRADOS`);
        }
        lista.push({ hito, valor: await this.valorDelHito(hito, t) });
      }

      // 3) Importes.
      const { subtotal, impuestos, total } = calcularImportes(
        lista.reduce((acc, h) => acc + h.valor, 0),
        tasa
      );
      if (subtotal <= 0) throw new AppError(409, 'Los hitos seleccionados no tienen valor facturable (sus entregables suman 0)');

      // 4) RN-03.
      const yaFacturado = await this.repository.sumSubtotalDeCampania(campaniaId, t);
      if (excedePresupuesto({ presupuestoAprobado, yaFacturado, nuevoSubtotal: subtotal })) {
        throw new AppError(
          409,
          `RN-03: facturar ${subtotal} excede el presupuesto aprobado (${presupuestoAprobado}); ya facturado: ${redondear2(yaFacturado)}`
        );
      }

      // 5) Número NC-<año>-<consecutivo de 6 dígitos> (RN-07; el índice único es la última defensa -> 409).
      const anio = new Date().getFullYear();
      const ultimo = await this.repository.findUltimoNumeroDelAnio(anio, t);
      const consecutivo = ultimo ? Number(ultimo.split('-')[2]) + 1 : 1;
      const numero = `NC-${anio}-${String(consecutivo).padStart(6, '0')}`;

      // 6) Factura + factura_hitos + hitos FACTURADO.
      const factura = await this.repository.create({ campania_id: campaniaId, numero, subtotal, impuestos, total }, t);
      for (const { hito, valor } of lista) {
        await this.repository.createHito({ factura_id: factura.id, hito_id: hito.id, valor }, t);
        await this.hitos.update(hito, { estado: 'FACTURADO' }, t);
      }

      return {
        factura: toFacturaResponse(factura),
        hitos: lista.map(({ hito, valor }) => ({ hito_id: hito.id, valor })),
        presupuesto_aprobado: presupuestoAprobado,
        total_facturado_campania: redondear2(yaFacturado + subtotal),
      };
    });
  }
}
