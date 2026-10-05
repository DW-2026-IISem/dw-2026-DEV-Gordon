import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';
import { hashPassword } from '../../../shared/auth/password';

export const STATUS_USER = ['active', 'inactive'] as const;

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare email: string;
  // Siempre almacena el hash bcrypt (lo genera el hook beforeSave), nunca la contraseña en claro.
  declare password: string;
  declare status: CreationOptional<(typeof STATUS_USER)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(50), allowNull: false, validate: { len: [3, 50] } },
    email: { type: DataTypes.STRING(120), allowNull: false, validate: { isEmail: true } },
    password: { type: DataTypes.STRING(255), allowNull: false },
    // Nace inactivo: un usuario solo accede cuando se activa explícitamente.
    status: {
      type: DataTypes.ENUM(...STATUS_USER),
      allowNull: false,
      defaultValue: 'inactive',
      validate: { isIn: [[...STATUS_USER]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      { name: 'uq_users_username', unique: true, fields: ['username'] },
      { name: 'uq_users_email', unique: true, fields: ['email'] },
    ],
    hooks: {
      // username y email se guardan en minúsculas; la contraseña se hashea solo si cambió.
      beforeSave: async (user) => {
        if (user.changed('username')) user.username = user.username.trim().toLowerCase();
        if (user.changed('email')) user.email = user.email.trim().toLowerCase();
        if (user.changed('password')) user.password = await hashPassword(user.password);
      },
    },
  }
);
