import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
import { registerModel, sequelize } from '../../../../../infrastructure/database/sequelize/sequelize.factory.js';
import { ClienteModel } from '../../../clientes/infrastructure/models/cliente.model.js';

export class CampaniaModel extends Model<InferAttributes<CampaniaModel>, InferCreationAttributes<CampaniaModel>> {
  declare id: CreationOptional<number>;
  declare clienteId: number;
  declare nombre: string;
  declare descripcion: CreationOptional<string | null>;
  declare isActive: CreationOptional<boolean>;
}

CampaniaModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'cliente_id',
      references: {
        model: ClienteModel,
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
    modelName: 'Campania',
    tableName: 'campanias',
    timestamps: true,
    underscored: true,
  },
);

CampaniaModel.belongsTo(ClienteModel, { foreignKey: 'clienteId', as: 'cliente' });

registerModel(CampaniaModel);
