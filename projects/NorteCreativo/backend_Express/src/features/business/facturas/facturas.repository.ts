import { InferAttributes, Op, Transaction } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { Campania } from '../campanias/campania.model';
import { Hito } from '../hitos/hito.model';
import { FacturaHito } from './factura-hito.model';
import { Factura } from './factura.model';
import './factura.associations';

export const MSG_NUMERO_DUPLICADO = 'El número de factura ya existe (RN-07) o el hito ya está en esa factura';

const MENSAJES = {
  unique: MSG_NUMERO_DUPLICADO,
  foreignKey: 'La campaña o el hito no son válidos para esta operación',
};

// La factura es un registro contable: solo se lee y se crea (sin update ni delete).
export class FacturasRepository {
  public findAllActive(campaniaId?: number): Promise<Factura[]> {
    return Factura.findAll({
      where: { status: 'active', ...(campaniaId !== undefined ? { campania_id: campaniaId } : {}) },
      order: [['id', 'ASC']],
    });
  }

  public findByIdWithHitos(id: number): Promise<Factura | null> {
    return Factura.findByPk(id, {
      include: [
        { model: FacturaHito, as: 'hitos', include: [{ model: Hito, as: 'hito' }] },
        { model: Campania, as: 'campania' },
      ],
      order: [[{ model: FacturaHito, as: 'hitos' }, 'id', 'ASC']],
    });
  }

  // Suma de subtotales ya facturados de la campaña (base de RN-03).
  public async sumSubtotalDeCampania(campaniaId: number, transaction: Transaction): Promise<number> {
    const facturas = await Factura.findAll({
      where: { campania_id: campaniaId, status: 'active' },
      attributes: ['subtotal'],
      transaction,
    });
    return facturas.reduce((acc, f) => acc + f.subtotal, 0);
  }

  // Último número emitido del año (para el consecutivo). Lectura sin bloqueo: si dos facturaciones simultáneas obtienen el
  // mismo consecutivo, el índice único de numero (RN-07) rechaza a una y el service reintenta la transacción.
  public async findUltimoNumeroDelAnio(anio: number, transaction: Transaction): Promise<string | null> {
    const ultima = await Factura.findOne({
      where: { numero: { [Op.like]: `NC-${anio}-%` } },
      order: [['numero', 'DESC']],
      attributes: ['numero'],
      transaction,
    });
    return ultima?.numero ?? null;
  }

  public create(data: Partial<InferAttributes<Factura>>, transaction: Transaction): Promise<Factura> {
    return guardDb(() => Factura.create(data as any, { transaction }), MENSAJES);
  }

  public createHito(data: Partial<InferAttributes<FacturaHito>>, transaction: Transaction): Promise<FacturaHito> {
    return guardDb(() => FacturaHito.create(data as any, { transaction }), MENSAJES);
  }
}
