import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';

export const STATUS_RESOURCE_ROLE = ['active', 'inactive'] as const;

// El permiso real: no existe entidad Permission, un permiso es la fila (rol, recurso).
export class ResourceRole extends Model<InferAttributes<ResourceRole>, InferCreationAttributes<ResourceRole>> {
  declare id: CreationOptional<number>;
  declare role_id: number;
  declare resource_id: number;
  declare status: CreationOptional<(typeof STATUS_RESOURCE_ROLE)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ResourceRole.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'roles', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    resource_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'resources', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM(...STATUS_RESOURCE_ROLE),
      allowNull: false,
      defaultValue: 'inactive',
      validate: { isIn: [[...STATUS_RESOURCE_ROLE]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'resource_roles',
    timestamps: true,
    indexes: [{ name: 'uq_resource_roles_role_resource', unique: true, fields: ['role_id', 'resource_id'] }],
  }
);
