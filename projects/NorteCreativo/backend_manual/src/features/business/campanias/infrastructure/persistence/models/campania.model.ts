import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ClienteModel } from '../../../../clientes/infrastructure/persistence/models/cliente.model.js';

@Table({ tableName: 'campanias', timestamps: true })
export class CampaniaModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => ClienteModel)
  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare clienteId: number;

  @BelongsTo(() => ClienteModel)
  cliente?: ClienteModel;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descripcion: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;
}
