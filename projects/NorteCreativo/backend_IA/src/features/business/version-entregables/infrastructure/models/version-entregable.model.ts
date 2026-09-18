import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
import { registerModel, sequelize } from '../../../../../infrastructure/database/sequelize/sequelize.factory.js';
import { EntregableModel } from '../../../entregables/infrastructure/models/entregable.model.js';
import { ESTADOS_VERSION_ENTREGABLE, type EstadoVersionEntregable } from '../../domain/entities/version-entregable.entity.js';

export class VersionEntregableModel extends Model<
  InferAttributes<VersionEntregableModel>,
  InferCreationAttributes<VersionEntregableModel>
> {
  declare id: CreationOptional<number>;
  declare entregableId: number;
  declare numeroVersion: number;
  declare fechaInicio: CreationOptional<Date | null>;
  declare fechaFin: CreationOptional<Date | null>;
  declare total: CreationOptional<number | null>;
  declare estado: CreationOptional<EstadoVersionEntregable>;
  declare observaciones: CreationOptional<string | null>;
}

VersionEntregableModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    entregableId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'entregable_id',
      references: {
        model: EntregableModel,
        key: 'id',
      },
    },
    numeroVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'numero_version',
    },
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'fecha_inicio',
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'fecha_fin',
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_VERSION_ENTREGABLE),
      allowNull: false,
      defaultValue: 'EN_REVISION',
    },
    observaciones: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'VersionEntregable',
    tableName: 'version_entregables',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['entregable_id', 'numero_version'],
        name: 'version_entregables_entregable_id_numero_version_unique',
      },
    ],
  },
);

VersionEntregableModel.belongsTo(EntregableModel, { foreignKey: 'entregableId', as: 'entregable' });

registerModel(VersionEntregableModel);
