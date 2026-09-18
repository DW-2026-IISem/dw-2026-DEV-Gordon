import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
import { registerModel, sequelize } from '../../../../../infrastructure/database/sequelize/sequelize.factory.js';
import { HitoModel } from '../../../hitos/infrastructure/models/hito.model.js';

export class TareaModel extends Model<InferAttributes<TareaModel>, InferCreationAttributes<TareaModel>> {
  declare id: CreationOptional<number>;
  declare hitoId: number;
  declare nombre: string;
  declare descripcion: CreationOptional<string | null>;
  declare isActive: CreationOptional<boolean>;
}

TareaModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    hitoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'hito_id',
      references: {
        model: HitoModel,
        key: 'id',
      },
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    modelName: 'Tarea',
    tableName: 'tareas',
    timestamps: true,
    underscored: true,
  },
);

TareaModel.belongsTo(HitoModel, { foreignKey: 'hitoId', as: 'hito' });

registerModel(TareaModel);
