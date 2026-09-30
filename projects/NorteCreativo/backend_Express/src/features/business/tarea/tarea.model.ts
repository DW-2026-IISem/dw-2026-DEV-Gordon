import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';

export const STATUS_TAREA = ['active', 'inactive'] as const;

export class Tarea extends Model<InferAttributes<Tarea>, InferCreationAttributes<Tarea>> {
  declare id: CreationOptional<number>;
  declare hito_id: number;
  declare nombre: string;
  declare descripcion: string | null;
  declare status: CreationOptional<(typeof STATUS_TAREA)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Tarea.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    hito_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'hitos', key: 'id' },
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
      type: DataTypes.ENUM(...STATUS_TAREA),
      allowNull: false,
      defaultValue: 'active',
      validate: { isIn: [[...STATUS_TAREA]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'tareas',
    timestamps: true,
  }
);
