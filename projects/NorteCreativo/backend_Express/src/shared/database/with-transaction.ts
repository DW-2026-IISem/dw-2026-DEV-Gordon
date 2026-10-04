import { Transaction } from 'sequelize';
import { sequelize } from '../../database/db';

export async function withTransaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
  const transaction = await sequelize.transaction();
  try {
    const result = await work(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback().catch(() => undefined);
    throw error;
  }
}
