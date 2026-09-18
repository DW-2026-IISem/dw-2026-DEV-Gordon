import { Injectable } from '@nestjs/common';
import type { Transaction } from 'sequelize';
import { sequelize } from '../../../../../infrastructure/database/sequelize/sequelize.factory.js';
import { EntregableModel } from '../../../entregables/infrastructure/models/entregable.model.js';
import { HitoModel } from '../../../hitos/infrastructure/models/hito.model.js';
import { TareaModel } from '../../../tareas/infrastructure/models/tarea.model.js';
import { VersionEntregableModel } from '../../../version-entregables/infrastructure/models/version-entregable.model.js';
import { Aprobacion } from '../../domain/entities/aprobacion.entity.js';
import { CierreHitoEvaluator, type EntregableUltimaVersion } from '../../domain/services/cierre-hito-evaluator.js';
import { HitoCerradoNoAdmiteAprobacionException } from '../../domain/exceptions/hito-cerrado-no-admite-aprobacion.exception.js';
import { VersionNoEncontradaException } from '../../domain/exceptions/version-no-encontrada.exception.js';
import type {
  IAprobacionRepository,
  RegistrarAprobacionData,
  RegistrarAprobacionResultado,
} from '../../domain/interfaces/aprobacion-repository.interface.js';
import { AprobacionModel } from '../models/aprobacion.model.js';

@Injectable()
export class AprobacionRepository implements IAprobacionRepository {
  private readonly cierreHitoEvaluator = new CierreHitoEvaluator();

  /**
   * Única transacción de Sequelize: sube Version → Entregable → Tarea →
   * Hito (bloqueando el Hito con `LOCK.UPDATE` para serializar cierres
   * concurrentes), registra la aprobación/rechazo y, si aplica, cierra el
   * hito. Cualquier excepción revierte todo (nada queda a medias).
   */
  async registrarYEvaluarCierre(data: RegistrarAprobacionData): Promise<RegistrarAprobacionResultado> {
    return sequelize.transaction(async (t) => {
      const version = await VersionEntregableModel.findByPk(data.versionEntregableId, { transaction: t });

      if (!version) {
        throw new VersionNoEncontradaException(data.versionEntregableId);
      }

      const entregable = await EntregableModel.findByPk(version.entregableId, { transaction: t });

      if (!entregable) {
        throw new VersionNoEncontradaException(data.versionEntregableId);
      }

      const tarea = await TareaModel.findByPk(entregable.tareaId, { transaction: t });

      if (!tarea) {
        throw new VersionNoEncontradaException(data.versionEntregableId);
      }

      const hito = await HitoModel.findByPk(tarea.hitoId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!hito) {
        throw new VersionNoEncontradaException(data.versionEntregableId);
      }

      if (hito.estado !== 'ABIERTO') {
        throw new HitoCerradoNoAdmiteAprobacionException(hito.id);
      }

      const aprobacionRow = await AprobacionModel.create(
        {
          versionEntregableId: data.versionEntregableId,
          estado: data.estado,
          aprobadorId: data.aprobadorId,
          comentario: data.comentario ?? null,
        },
        { transaction: t },
      );

      version.estado = data.estado;
      await version.save({ transaction: t });

      const aprobacion = this.toDomain(aprobacionRow);

      if (data.estado === 'RECHAZADA') {
        return {
          aprobacion,
          hitoCerrado: false,
          hitoId: hito.id,
          fechaCierre: null,
        };
      }

      const debeCerrarHito = await this.evaluarCierre(hito.id, t);

      if (!debeCerrarHito) {
        return {
          aprobacion,
          hitoCerrado: false,
          hitoId: hito.id,
          fechaCierre: null,
        };
      }

      const fechaCierre = new Date();
      hito.estado = 'CERRADO';
      hito.fechaCierre = fechaCierre;
      await hito.save({ transaction: t });

      return {
        aprobacion,
        hitoCerrado: true,
        hitoId: hito.id,
        fechaCierre,
      };
    });
  }

  async findById(id: number): Promise<Aprobacion | null> {
    const row = await AprobacionModel.findByPk(id);
    return row ? this.toDomain(row) : null;
  }

  /**
   * Recorre todas las tareas del hito y sus entregables, toma la última
   * versión de cada uno y delega la regla de cierre (RN-02) a
   * `CierreHitoEvaluator` (dominio). Consultas secuenciales a propósito:
   * todas comparten la misma conexión/transacción.
   */
  private async evaluarCierre(hitoId: number, t: Transaction): Promise<boolean> {
    const tareasDelHito = await TareaModel.findAll({ where: { hitoId }, transaction: t });
    const entregablesConUltimaVersion: EntregableUltimaVersion[] = [];

    for (const tareaRow of tareasDelHito) {
      const entregablesDeLaTarea = await EntregableModel.findAll({
        where: { tareaId: tareaRow.id },
        transaction: t,
      });

      for (const entregableRow of entregablesDeLaTarea) {
        const ultimaVersion = await VersionEntregableModel.findOne({
          where: { entregableId: entregableRow.id },
          order: [['numeroVersion', 'DESC']],
          transaction: t,
        });

        entregablesConUltimaVersion.push({
          entregableId: entregableRow.id,
          ultimaVersionEstado: ultimaVersion?.estado ?? null,
        });
      }
    }

    return this.cierreHitoEvaluator.debeCerrarHito(entregablesConUltimaVersion);
  }

  private toDomain(row: AprobacionModel): Aprobacion {
    return new Aprobacion({
      id: row.id,
      versionEntregableId: row.versionEntregableId,
      estado: row.estado,
      aprobadorId: row.aprobadorId,
      comentario: row.comentario,
      fecha: row.fecha,
    });
  }
}
