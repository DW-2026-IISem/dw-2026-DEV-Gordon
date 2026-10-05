import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';

export const STATUS_ROLE = ['active', 'inactive'] as const;

export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string | null;
  declare status: CreationOptional<(typeof STATUS_ROLE)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Role.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false, validate: { len: [2, 50] } },
    description: { type: DataTypes.STRING(255), allowNull: true },
    status: {
      type: DataTypes.ENUM(...STATUS_ROLE),
      allowNull: false,
      defaultValue: 'inactive',
      validate: { isIn: [[...STATUS_ROLE]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'roles',
    timestamps: true,
    indexes: [{ name: 'uq_roles_name', unique: true, fields: ['name'] }],
    hooks: {
      // Los nombres de rol se guardan en mayúsculas (ADMIN, GESTOR...).
      beforeSave: (role) => {
        if (role.changed('name')) role.name = role.name.trim().toUpperCase();
      },
    },
  }
);
