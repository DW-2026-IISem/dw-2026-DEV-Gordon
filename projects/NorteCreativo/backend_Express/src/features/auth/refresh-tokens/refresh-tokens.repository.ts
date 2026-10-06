import { InferAttributes, Op, Transaction } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { RefreshToken } from './refresh-token.model';

const MENSAJES = { unique: 'El token ya existe', foreignKey: 'El user_id no es válido' };

// Las lecturas normales excluyen token_hash desde el SELECT; solo findByHash lo necesita.
const SIN_HASH = { exclude: ['token_hash'] };

export class RefreshTokensRepository {
  // Búsqueda por hash. Con lock=true añade FOR UPDATE (rotación segura bajo concurrencia; requiere transacción).
  public findByHash(tokenHash: string, transaction?: Transaction, lock = false): Promise<RefreshToken | null> {
    return RefreshToken.findOne({
      where: { token_hash: tokenHash },
      transaction,
      lock: lock && transaction ? transaction.LOCK.UPDATE : undefined,
    });
  }

  // Sesiones ACTIVAS del usuario (las revocadas dejan de listarse).
  public findAllActiveByUser(userId: number): Promise<RefreshToken[]> {
    return RefreshToken.findAll({ attributes: SIN_HASH, where: { user_id: userId, status: 'active' }, order: [['id', 'ASC']] });
  }

  // La frontera de seguridad: el id SIEMPRE se busca junto con el user_id del dueño.
  public findByIdAndUser(id: number, userId: number): Promise<RefreshToken | null> {
    return RefreshToken.findOne({ attributes: SIN_HASH, where: { id, user_id: userId } });
  }

  public create(data: Partial<InferAttributes<RefreshToken>>, transaction?: Transaction): Promise<RefreshToken> {
    return guardDb(() => RefreshToken.create(data as any, { transaction }), MENSAJES);
  }

  public update(token: RefreshToken, data: Partial<InferAttributes<RefreshToken>>, transaction?: Transaction): Promise<RefreshToken> {
    return guardDb(() => token.update(data, { transaction }), MENSAJES);
  }

  // Respuesta a un reuso: revoca TODA la cadena (family_id). Devuelve cuántas filas pasaron a inactive.
  public async revokeFamily(familyId: string, transaction?: Transaction): Promise<number> {
    const [afectadas] = await RefreshToken.update(
      { status: 'inactive', revoked_at: new Date() },
      { where: { family_id: familyId, status: 'active' }, transaction }
    );
    return afectadas;
  }

  public async revokeAllByUser(userId: number): Promise<number> {
    const [afectadas] = await RefreshToken.update({ status: 'inactive', revoked_at: new Date() }, { where: { user_id: userId, status: 'active' } });
    return afectadas;
  }

  // Borrado físico de las sesiones del usuario ya revocadas o vencidas.
  public purgeInactiveByUser(userId: number): Promise<number> {
    return RefreshToken.destroy({
      where: { user_id: userId, [Op.or]: [{ status: 'inactive' }, { expires_at: { [Op.lt]: new Date() } }] },
    });
  }

  public countActiveByUser(userId: number): Promise<number> {
    return RefreshToken.count({ where: { user_id: userId, status: 'active', expires_at: { [Op.gt]: new Date() } } });
  }
}
