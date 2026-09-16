import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { VersionEntregableModel } from '../../../../version-entregables/infrastructure/persistence/models/version-entregable.model.js';

@Table({ tableName: 'aprobaciones', timestamps: true })
export class AprobacionModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => VersionEntregableModel)
  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare versionEntregableId: number;

  @BelongsTo(() => VersionEntregableModel)
  versionEntregable?: VersionEntregableModel;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'PENDIENTE' })
  declare estado: string;

  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare aprobadorId: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare comentario: string | null;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare fecha: Date;
}
