import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { EntregableModel } from '../../../../entregables/infrastructure/persistence/models/entregable.model.js';

@Table({ tableName: 'version_entregables', timestamps: true })
export class VersionEntregableModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => EntregableModel)
  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare entregableId: number;

  @BelongsTo(() => EntregableModel)
  entregable?: EntregableModel;

  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare numeroVersion: number;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fechaInicio: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fechaFin: Date | null;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
  declare total: number | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'EN_REVISION' })
  declare estado: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare observaciones: string | null;
}
