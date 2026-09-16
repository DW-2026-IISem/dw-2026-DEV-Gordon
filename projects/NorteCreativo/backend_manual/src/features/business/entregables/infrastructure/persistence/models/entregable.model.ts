import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { TareaModel } from '../../../../tareas/infrastructure/persistence/models/tarea.model.js';

@Table({ tableName: 'entregables', timestamps: true })
export class EntregableModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => TareaModel)
  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare tareaId: number;

  @BelongsTo(() => TareaModel)
  tarea?: TareaModel;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fechaInicio: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fechaFin: Date | null;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
  declare total: number | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'EN_PROCESO' })
  declare estado: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare observaciones: string | null;
}
