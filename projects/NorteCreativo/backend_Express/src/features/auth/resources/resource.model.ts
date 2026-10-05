import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';
import { normalizePath } from '../../../shared/auth/resource-match';

export const METODOS_HTTP = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export const STATUS_RESOURCE = ['active', 'inactive'] as const;

// Un recurso es una operación HTTP: el par (method, path), p. ej. GET /api/hitos/:id.
export class Resource extends Model<InferAttributes<Resource>, InferCreationAttributes<Resource>> {
  declare id: CreationOptional<number>;
  declare method: (typeof METODOS_HTTP)[number];
  declare path: string;
  declare description: string | null;
  declare status: CreationOptional<(typeof STATUS_RESOURCE)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Resource.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    method: { type: DataTypes.ENUM(...METODOS_HTTP), allowNull: false, validate: { isIn: [[...METODOS_HTTP]] } },
    path: { type: DataTypes.STRING(191), allowNull: false, validate: { notEmpty: true } },
    description: { type: DataTypes.STRING(255), allowNull: true },
    status: {
      type: DataTypes.ENUM(...STATUS_RESOURCE),
      allowNull: false,
      defaultValue: 'inactive',
      validate: { isIn: [[...STATUS_RESOURCE]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'resources',
    timestamps: true,
    indexes: [{ name: 'uq_resources_method_path', unique: true, fields: ['method', 'path'] }],
    hooks: {
      // La ruta se guarda en forma canónica (sin query ni barra final).
      beforeSave: (resource) => {
        if (resource.changed('path')) resource.path = normalizePath(resource.path);
      },
    },
  }
);
