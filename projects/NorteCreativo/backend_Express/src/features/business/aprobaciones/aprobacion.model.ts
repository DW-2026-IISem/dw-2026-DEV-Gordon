import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';

export const ESTADOS_APROBACION = ['PENDIENTE', 'APROBADA', 'RECHAZADA'] as const;
export const STATUS_APROBACION = ['active', 'inactive'] as const;

export class Aprobacion extends Model<InferAttributes<Aprobacion>, InferCreationAttributes<Aprobacion>> {
  declare id: CreationOptional<number>;
  declare version_entregable_id: number;
  declare estado: (typeof ESTADOS_APROBACION)[number];
  declare aprobador_id: number;
  declare comentario: string | null;
  declare fecha: CreationOptional<Date>;
  declare status: CreationOptional<(typeof STATUS_APROBACION)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Aprobacion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    version_entregable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'version_entregables', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_APROBACION),
      allowNull: false,
      validate: { isIn: [[...ESTADOS_APROBACION]] },
    },
    // RN-05: el aprobador es el usuario autenticado que registra la aprobación.
    aprobador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM(...STATUS_APROBACION),
      allowNull: false,
      defaultValue: 'active',
      validate: { isIn: [[...STATUS_APROBACION]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'aprobaciones',
    timestamps: true,
  }
);
