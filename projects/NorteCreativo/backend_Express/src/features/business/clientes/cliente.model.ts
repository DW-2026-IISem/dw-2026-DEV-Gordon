import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';

export const TIPOS_DOCUMENTO = ['CC', 'NIT', 'CE', 'TI', 'PASAPORTE'] as const;
export const ESTADOS_CLIENTE = ['active', 'inactive'] as const;

export class Cliente extends Model<InferAttributes<Cliente>, InferCreationAttributes<Cliente>> {
  declare id: CreationOptional<number>;
  declare tipo_documento: (typeof TIPOS_DOCUMENTO)[number];
  declare numero_documento: string;
  declare nombre: string;
  declare telefono: string | null;
  declare email: string | null;
  declare status: CreationOptional<(typeof ESTADOS_CLIENTE)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Cliente.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo_documento: {
      type: DataTypes.ENUM(...TIPOS_DOCUMENTO),
      allowNull: false,
      validate: { isIn: [[...TIPOS_DOCUMENTO]] },
    },
    numero_documento: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    status: {
      type: DataTypes.ENUM(...ESTADOS_CLIENTE),
      allowNull: false,
      defaultValue: 'active',
      validate: { isIn: [[...ESTADOS_CLIENTE]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'clientes',
    timestamps: true,
  }
);
