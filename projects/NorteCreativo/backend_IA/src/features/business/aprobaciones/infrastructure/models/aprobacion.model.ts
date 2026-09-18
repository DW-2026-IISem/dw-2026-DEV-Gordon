import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
import { registerModel, sequelize } from '../../../../../infrastructure/database/sequelize/sequelize.factory.js';
import { VersionEntregableModel } from '../../../version-entregables/infrastructure/models/version-entregable.model.js';
import { ESTADOS_APROBACION, type EstadoAprobacion } from '../../domain/entities/aprobacion.entity.js';

export class AprobacionModel extends Model<InferAttributes<AprobacionModel>, InferCreationAttributes<AprobacionModel>> {
  declare id: CreationOptional<number>;
  declare versionEntregableId: number;
  declare estado: EstadoAprobacion;
  declare aprobadorId: number;
  declare comentario: CreationOptional<string | null>;
  declare fecha: CreationOptional<Date>;
}

AprobacionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    versionEntregableId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'version_entregable_id',
      references: {
        model: VersionEntregableModel,
        key: 'id',
      },
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_APROBACION),
      allowNull: false,
    },
    /**
     * Sin FK a un modelo de usuario a propósito: ISS-07 registra quién
     * aprueba pero NO valida su rol contra RBAC (eso queda para una fase
     * siguiente, y esta feature tiene prohibido traer Auth/Users).
     */
    aprobadorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'aprobador_id',
    },
    comentario: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Aprobacion',
    tableName: 'aprobaciones',
    timestamps: true,
    underscored: true,
  },
);

AprobacionModel.belongsTo(VersionEntregableModel, { foreignKey: 'versionEntregableId', as: 'versionEntregable' });

registerModel(AprobacionModel);
