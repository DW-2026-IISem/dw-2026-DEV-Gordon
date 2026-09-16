import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { EntregableModel } from '../../../../entregables/infrastructure/persistence/models/entregable.model.js';
import { HitoModel } from '../../../../hitos/infrastructure/persistence/models/hito.model.js';
import { TareaModel } from '../../../../tareas/infrastructure/persistence/models/tarea.model.js';
import { VersionEntregableModel } from '../../../../version-entregables/infrastructure/persistence/models/version-entregable.model.js';
import { Aprobacion } from '../../../domain/entities/aprobacion.entity.js';
import type { AprobacionEstado } from '../../../domain/entities/aprobacion.entity.js';
import { CierreHitoEvaluator } from '../../../domain/services/cierre-hito-evaluator.js';
import type { EntregableConEstado } from '../../../domain/services/cierre-hito-evaluator.js';
import { HitoCerradoNoAdmiteAprobacionException } from '../../../domain/exceptions/hito-cerrado-no-admite-aprobacion.exception.js';
import { VersionNoEncontradaException } from '../../../domain/exceptions/version-no-encontrada.exception.js';
import {
  IAprobacionRepository,
  RegistrarAprobacionResultado,
} from '../../../domain/interfaces/aprobacion.repository.js';
import { AprobacionModel } from '../models/aprobacion.model.js';

@Injectable()
export class AprobacionRepository implements IAprobacionRepository {
  private readonly evaluator = new CierreHitoEvaluator();

  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  async registrarYEvaluarCierre(aprobacion: Aprobacion): Promise<RegistrarAprobacionResultado> {
    return this.sequelize.transaction(async (t) => {
      const aprobacionRepo = this.sequelize.getRepository(AprobacionModel);
      const versionRepo = this.sequelize.getRepository(VersionEntregableModel);
      const entregableRepo = this.sequelize.getRepository(EntregableModel);
      const tareaRepo = this.sequelize.getRepository(TareaModel);
      const hitoRepo = this.sequelize.getRepository(HitoModel);

      // Paso 3 del SDD: identificar a qué hito pertenece la versión aprobada
      // (Version -> Entregable -> Tarea -> Hito), bloqueando el hito para
      // evitar condiciones de carrera si dos aprobaciones llegan casi juntas.
      const version = await versionRepo.findByPk(aprobacion.versionEntregableId, {
        transaction: t,
      });
      if (!version) {
        throw new VersionNoEncontradaException(aprobacion.versionEntregableId);
      }
      const entregable = await entregableRepo.findByPk(version.entregableId, { transaction: t });
      const tarea = await tareaRepo.findByPk(entregable!.tareaId, { transaction: t });
      const hito = await hitoRepo.findByPk(tarea!.hitoId, {
        transaction: t,
        lock: Transaction.LOCK.UPDATE,
      });

      // RN-06: un hito cerrado no admite nuevas versiones ni aprobaciones.
      if (hito!.estado !== 'ABIERTO') {
        throw new HitoCerradoNoAdmiteAprobacionException(hito!.id);
      }

      // Paso 2 del SDD: registrar la aprobación (APROBADA o RECHAZADA).
      const createdAprobacion = await aprobacionRepo.create(
        {
          versionEntregableId: aprobacion.versionEntregableId,
          estado: aprobacion.estado,
          aprobadorId: aprobacion.aprobadorId,
          comentario: aprobacion.comentario,
          fecha: aprobacion.fecha,
        },
        { transaction: t },
      );

      // También se refleja el veredicto en la versión (para que
      // findUltimaVersion / consultas posteriores lo vean directo).
      await version.update({ estado: aprobacion.estado }, { transaction: t });

      const dominioAprobacion = new Aprobacion({
        id: createdAprobacion.id,
        versionEntregableId: createdAprobacion.versionEntregableId,
        estado: createdAprobacion.estado as AprobacionEstado,
        aprobadorId: createdAprobacion.aprobadorId,
        comentario: createdAprobacion.comentario,
        fecha: createdAprobacion.fecha,
      });

      // RN-01: si fue RECHAZADA, el hito NO se cierra. Se aborta aquí
      // (dentro de la misma transacción, que igual se confirma porque el
      // registro del rechazo sí debe persistir).
      if (aprobacion.estado === 'RECHAZADA') {
        return {
          aprobacion: dominioAprobacion,
          hitoCerrado: false,
          hitoId: null,
          fechaCierre: null,
        };
      }

      // Paso 4 del SDD: revisar TODOS los entregables del hito y el estado
      // de la última versión de cada uno.
      const tareasDelHito = await tareaRepo.findAll({
        where: { hitoId: hito!.id },
        transaction: t,
      });
      const entregablesDelHito = await entregableRepo.findAll({
        where: { tareaId: tareasDelHito.map((tt) => tt.id) },
        transaction: t,
      });

      const estados: EntregableConEstado[] = [];
      for (const e of entregablesDelHito) {
        const ultima = await versionRepo.findOne({
          where: { entregableId: e.id },
          order: [['numeroVersion', 'DESC']],
          transaction: t,
        });
        estados.push({
          entregableId: e.id,
          ultimaVersionEstado: (ultima?.estado as any) ?? null,
        });
      }

      // Paso 5/6 del SDD (vía CierreHitoEvaluator = RN-02):
      // si TODOS están APROBADOS, se cierra el hito en esta misma transacción.
      const debeCerrar = this.evaluator.debeCerrarHito(estados);

      if (!debeCerrar) {
        return {
          aprobacion: dominioAprobacion,
          hitoCerrado: false,
          hitoId: null,
          fechaCierre: null,
        };
      }

      const fechaCierre = new Date();
      await hito!.update(
        { estado: 'CERRADO', fechaCierre },
        { transaction: t },
      );

      return {
        aprobacion: dominioAprobacion,
        hitoCerrado: true,
        hitoId: hito!.id,
        fechaCierre,
      };
    });
  }

  async findById(id: number): Promise<Aprobacion | null> {
    const repo = this.sequelize.getRepository(AprobacionModel);
    const found = await repo.findByPk(id);
    if (!found) {
      return null;
    }
    return new Aprobacion({
      id: found.id,
      versionEntregableId: found.versionEntregableId,
      estado: found.estado as AprobacionEstado,
      aprobadorId: found.aprobadorId,
      comentario: found.comentario,
      fecha: found.fecha,
    });
  }
}
