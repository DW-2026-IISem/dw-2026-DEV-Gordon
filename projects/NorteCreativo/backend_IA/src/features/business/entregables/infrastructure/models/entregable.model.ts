import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
import { registerModel, sequelize } from '../../../../../infrastructure/database/sequelize/sequelize.factory.js';
import { TareaModel } from '../../../tareas/infrastructure/models/tarea.model.js';
import { ESTADO_ENTREGABLE_DEFAULT } from '../../domain/entities/entregable.entity.js';

export class EntregableModel extends Model<InferAttributes<EntregableModel>, InferCreationAttributes<EntregableModel>> {
  declare id: CreationOptional<number>;
  declare tareaId: number;
  declare fechaInicio: CreationOptional<Date | null>;
  declare fechaFin: CreationOptional<Date | null>;
  declare total: CreationOptional<number | null>;
  declare estado: CreationOptional<string>;
  declare observaciones: CreationOptional<string | null>;
}

EntregableModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tareaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tarea_id',
      references: {
        model: TareaModel,
        key: 'id',
      },
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
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: ESTADO_ENTREGABLE_DEFAULT,
    },
    observaciones: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Entregable',
    tableName: 'entregables',
    timestamps: true,
    underscored: true,
  },
);

EntregableModel.belongsTo(TareaModel, { foreignKey: 'tareaId', as: 'tarea' });

registerModel(EntregableModel);
