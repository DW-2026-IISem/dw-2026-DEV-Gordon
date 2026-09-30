import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';

export const ESTADOS_CAMPANIA = ['active', 'inactive'] as const;

export class Campania extends Model<InferAttributes<Campania>, InferCreationAttributes<Campania>> {
  declare id: CreationOptional<number>;
  declare cliente_id: number;
  declare nombre: string;
  declare descripcion: string | null;
  declare status: CreationOptional<(typeof ESTADOS_CAMPANIA)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Campania.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'clientes', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...ESTADOS_CAMPANIA),
      allowNull: false,
      defaultValue: 'active',
      validate: { isIn: [[...ESTADOS_CAMPANIA]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'campanias',
    timestamps: true,
  }
);
