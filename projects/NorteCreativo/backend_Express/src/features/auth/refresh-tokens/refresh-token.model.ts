import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';

export const STATUS_REFRESH_TOKEN = ['active', 'inactive'] as const;

// Refresh token opaco: solo se guarda su SHA-256 (token_hash). Revocable por sesión.
export class RefreshToken extends Model<InferAttributes<RefreshToken>, InferCreationAttributes<RefreshToken>> {
  declare id: CreationOptional<number>;
  declare user_id: number;
  // Identifica la cadena de rotaciones de un mismo inicio de sesión: si se reusa un token ya rotado, se revoca la familia entera.
  declare family_id: string;
  declare token_hash: string;
  declare expires_at: Date;
  declare revoked_at: Date | null;
  // Dispositivo/cliente que originó la sesión (informativo).
  declare device_info: string | null;
  // A diferencia del resto, nace activo: se crea al iniciar sesión.
  declare status: CreationOptional<(typeof STATUS_REFRESH_TOKEN)[number]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

RefreshToken.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    family_id: { type: DataTypes.CHAR(36), allowNull: false },
    token_hash: { type: DataTypes.CHAR(64), allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    revoked_at: { type: DataTypes.DATE, allowNull: true },
    device_info: { type: DataTypes.STRING(255), allowNull: true },
    status: {
      type: DataTypes.ENUM(...STATUS_REFRESH_TOKEN),
      allowNull: false,
      defaultValue: 'active',
      validate: { isIn: [[...STATUS_REFRESH_TOKEN]] },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'refresh_tokens',
    timestamps: true,
    indexes: [
      { name: 'uq_refresh_tokens_token_hash', unique: true, fields: ['token_hash'] },
      { name: 'ix_refresh_tokens_user', fields: ['user_id'] },
      { name: 'ix_refresh_tokens_family', fields: ['family_id'] },
    ],
  }
);
