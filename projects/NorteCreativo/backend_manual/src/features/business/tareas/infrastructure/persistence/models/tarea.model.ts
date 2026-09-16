import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { HitoModel } from '../../../../hitos/infrastructure/persistence/models/hito.model.js';

@Table({ tableName: 'tareas', timestamps: true })
export class TareaModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => HitoModel)
  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare hitoId: number;

  @BelongsTo(() => HitoModel)
  hito?: HitoModel;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descripcion: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;
}
