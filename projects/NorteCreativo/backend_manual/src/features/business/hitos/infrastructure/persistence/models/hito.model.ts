import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CampaniaModel } from '../../../../campanias/infrastructure/persistence/models/campania.model.js';

@Table({ tableName: 'hitos', timestamps: true })
export class HitoModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => CampaniaModel)
  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare campaniaId: number;

  @BelongsTo(() => CampaniaModel)
  campania?: CampaniaModel;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descripcion: string | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'ABIERTO' })
  declare estado: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fechaCierre: Date | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;
}
