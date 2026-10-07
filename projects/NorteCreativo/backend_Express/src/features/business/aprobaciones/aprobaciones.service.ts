import { withTransaction } from '../../../shared/database/with-transaction';
import { AppError } from '../../../shared/errors/app-error';
import { EntregablesRepository } from '../entregables/entregables.repository';
import { HitosRepository } from '../hitos/hitos.repository';
import { TareasRepository } from '../tareas/tareas.repository';
import { VersionEntregablesRepository } from '../version-entregables/version-entregables.repository';
import { AprobacionesRepository } from './aprobaciones.repository';
import { debeCerrarHito, EntregableUltimaVersion } from './cierre-hito.evaluator';
import {
  AprobacionResponseDto,
  CerrarHitoResponseDto,
  CreateAprobacionDto,
  VEREDICTOS,
  toAprobacionResponse,
} from './dto';

const entero = (valor: unknown): number | null => {
  const n = Number(valor);
  return valor !== undefined && valor !== null && valor !== '' && Number.isInteger(n) && n > 0 ? n : null;
};

export class AprobacionesService {
  constructor(
    private readonly repository: AprobacionesRepository = new AprobacionesRepository(),
    private readonly versiones: VersionEntregablesRepository = new VersionEntregablesRepository(),
    private readonly entregables: EntregablesRepository = new EntregablesRepository(),
    private readonly tareas: TareasRepository = new TareasRepository(),
    private readonly hitos: HitosRepository = new HitosRepository()
  ) {}

  public async getAll(): Promise<AprobacionResponseDto[]> {
    return (await this.repository.findAllActive()).map(toAprobacionResponse);
  }

  public async getOne(id: number): Promise<AprobacionResponseDto> {
    const aprobacion = await this.repository.findByIdWithVersion(id);
    if (!aprobacion) throw new AppError(404, 'Aprobación no encontrada');
    return toAprobacionResponse(aprobacion);
  }

  private validar(body: CreateAprobacionDto): { versionId: number; veredicto: (typeof VEREDICTOS)[number]; comentario: string | null } {
    // RN-05: el aprobador es SIEMPRE el usuario autenticado; enviarlo en el body es un error del cliente.
    if (Object.prototype.hasOwnProperty.call(body, 'aprobador_id')) {
      throw new AppError(400, 'Error de validación', ['aprobador_id no se acepta en el body: lo toma el sistema del usuario autenticado (RN-05)']);
    }
    const errores: string[] = [];
    const versionId = entero(body.version_entregable_id);
    if (versionId === null) errores.push('version_entregable_id es requerido y debe ser un entero positivo');
    if (typeof body.estado !== 'string' || !(VEREDICTOS as readonly string[]).includes(body.estado)) {
      errores.push(`estado debe ser uno de: ${VEREDICTOS.join(', ')}`);
    }
    if (body.comentario !== undefined && body.comentario !== null && typeof body.comentario !== 'string') {
      errores.push('comentario debe ser texto');
    }
    if (errores.length > 0) throw new AppError(400, 'Error de validación', errores);
    return {
      versionId: versionId!,
      veredicto: body.estado as (typeof VEREDICTOS)[number],
      comentario: typeof body.comentario === 'string' ? body.comentario : null,
    };
  }

  // CerrarHito: registra el veredicto y, si todos los entregables del hito quedan APROBADOS, cierra el hito.
  // Todo ocurre en una sola transacción (withTransaction); cualquier error revierte todo.
  // aprobadorId lo pone el controller desde req.auth (RN-05); nunca viene del body.
  public async create(body: CreateAprobacionDto, aprobadorId: number): Promise<CerrarHitoResponseDto> {
    const { versionId, veredicto, comentario } = this.validar(body);

    return withTransaction(async (t) => {
      const version = await this.versiones.findById(versionId, t);
      if (!version) throw new AppError(404, 'Versión de entregable no encontrada');

      const entregable = await this.entregables.findById(version.entregable_id, t);
      if (!entregable) throw new AppError(404, 'Entregable de la versión no encontrado');

      const tarea = await this.tareas.findById(entregable.tarea_id, t);
      if (!tarea) throw new AppError(404, 'Tarea del entregable no encontrada');

      // Bloqueo de fila del hito (en el repository): serializa aprobaciones concurrentes.
      const hito = await this.hitos.findByIdForUpdate(tarea.hito_id, t);
      if (!hito) throw new AppError(404, 'Hito de la tarea no encontrado');

      // RN-06
      if (hito.estado !== 'ABIERTO') {
        throw new AppError(409, 'El hito ya esta cerrado y no admite nuevas aprobaciones');
      }

      const aprobacion = await this.repository.create(
        { version_entregable_id: version.id, estado: veredicto, aprobador_id: aprobadorId, comentario },
        t
      );
      await this.versiones.update(version, { estado: veredicto }, t);

      const sinCierre = (): CerrarHitoResponseDto => ({
        aprobacion: toAprobacionResponse(aprobacion),
        hito_cerrado: false,
        hito_id: hito.id,
        fecha_cierre: null,
      });

      // RN-01: un rechazo nunca cierra el hito (la aprobación sí queda guardada).
      if (veredicto === 'RECHAZADA') return sinCierre();

      // Consultas secuenciales a propósito: comparten la misma conexión/transacción.
      const lista: EntregableUltimaVersion[] = [];
      for (const tareaHito of await this.tareas.findByHito(hito.id, t)) {
        for (const e of await this.entregables.findByTarea(tareaHito.id, t)) {
          const ultima = await this.versiones.findUltimaDeEntregable(e.id, t);
          lista.push({ entregable_id: e.id, ultima_version_estado: ultima?.estado ?? null });
        }
      }

      if (!debeCerrarHito(lista)) return sinCierre();

      const fechaCierre = new Date();
      await this.hitos.update(hito, { estado: 'CERRADO', fecha_cierre: fechaCierre }, t);
      return {
        aprobacion: toAprobacionResponse(aprobacion),
        hito_cerrado: true,
        hito_id: hito.id,
        fecha_cierre: fechaCierre,
      };
    });
  }
}
