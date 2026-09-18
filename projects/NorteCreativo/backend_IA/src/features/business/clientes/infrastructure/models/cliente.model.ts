import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
import { registerModel, sequelize } from '../../../../../infrastructure/database/sequelize/sequelize.factory.js';
import { TIPOS_DOCUMENTO_CLIENTE, type TipoDocumentoCliente } from '../../domain/entities/cliente.entity.js';

export class ClienteModel extends Model<InferAttributes<ClienteModel>, InferCreationAttributes<ClienteModel>> {
  declare id: CreationOptional<number>;
  declare tipoDocumento: TipoDocumentoCliente;
  declare numeroDocumento: string;
  declare nombre: string;
  declare telefono: CreationOptional<string | null>;
  declare email: CreationOptional<string | null>;
  declare estado: CreationOptional<boolean>;
}

ClienteModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipoDocumento: {
      type: DataTypes.ENUM(...TIPOS_DOCUMENTO_CLIENTE),
      allowNull: false,
      field: 'tipo_documento',
    },
    numeroDocumento: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      field: 'numero_documento',
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Cliente',
    tableName: 'clientes',
    timestamps: true,
    underscored: true,
  },
);

registerModel(ClienteModel);
