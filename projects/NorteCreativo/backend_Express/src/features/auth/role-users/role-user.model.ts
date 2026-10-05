import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';

export const STATUS_ROLE_USER = ['active', 'inactive'] as const;

// Asignación N:M usuario <-> rol.
export class RoleUser extends Model<InferAttributes<RoleUser>, InferCreationAttributes<RoleUser>> {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare role_id: number;
  declare status: CreationOptional<(typeof STATUS_ROLE_USER)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

RoleUser.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'roles', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM(...STATUS_ROLE_USER),
      allowNull: false,
      defaultValue: 'inactive',
      validate: { isIn: [[...STATUS_ROLE_USER]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'role_users',
    timestamps: true,
    indexes: [{ name: 'uq_role_users_user_role', unique: true, fields: ['user_id', 'role_id'] }],
  }
);
