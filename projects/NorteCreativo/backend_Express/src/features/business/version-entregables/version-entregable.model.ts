import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';

export const ESTADOS_VERSION = ['EN_REVISION', 'APROBADA', 'RECHAZADA'] as const;
export const STATUS_VERSION = ['active', 'inactive'] as const;

export class VersionEntregable extends Model<
  InferAttributes<VersionEntregable>,
  InferCreationAttributes<VersionEntregable>
> {
  declare id: CreationOptional<number>;
  declare entregable_id: number;
  declare numero_version: number;
  declare fecha_inicio: Date | null;
  declare fecha_fin: Date | null;
  declare total: number | null;
  declare estado: CreationOptional<(typeof ESTADOS_VERSION)[number]>;
  declare observaciones: string | null;
  declare status: CreationOptional<(typeof STATUS_VERSION)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

VersionEntregable.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    entregable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'entregables', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    numero_version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: { isDate: true },
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: { isDate: true },
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: { isDecimal: true, min: 0 },
      // Los drivers devuelven DECIMAL como string: se responde siempre como Number.
      get() {
        const valor = this.getDataValue('total') as unknown;
        return valor === null || valor === undefined ? null : Number(valor);
      },
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_VERSION),
      allowNull: false,
      defaultValue: 'EN_REVISION',
      validate: { isIn: [[...ESTADOS_VERSION]] },
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...STATUS_VERSION),
      allowNull: false,
      defaultValue: 'active',
      validate: { isIn: [[...STATUS_VERSION]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'version_entregables',
    timestamps: true,
    indexes: [
      {
        name: 'uq_version_entregables_entregable_numero',
        unique: true,
        fields: ['entregable_id', 'numero_version'],
      },
    ],
  }
);
