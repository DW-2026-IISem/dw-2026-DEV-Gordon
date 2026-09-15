import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'clientes', timestamps: true })
export class ClienteModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare tipoDocumento: string;

  @Column({ type: DataType.STRING(30), allowNull: false, unique: true })
  declare numeroDocumento: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.STRING(30), allowNull: true })
  declare telefono: string | null;

  @Column({ type: DataType.STRING(150), allowNull: true })
  declare email: string | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'active' })
  declare estado: string;
}
