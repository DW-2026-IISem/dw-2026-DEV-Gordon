import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
import { registerModel, sequelize } from '../../../../../infrastructure/database/sequelize/sequelize.factory.js';
import { CampaniaModel } from '../../../campanias/infrastructure/models/campania.model.js';
import { ESTADOS_HITO, type EstadoHito } from '../../domain/entities/hito.entity.js';

export class HitoModel extends Model<InferAttributes<HitoModel>, InferCreationAttributes<HitoModel>> {
  declare id: CreationOptional<number>;
  declare campaniaId: number;
  declare nombre: string;
  declare descripcion: CreationOptional<string | null>;
  declare estado: CreationOptional<EstadoHito>;
  declare fechaCierre: CreationOptional<Date | null>;
  declare isActive: CreationOptional<boolean>;
}

HitoModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    campaniaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'campania_id',
      references: {
        model: CampaniaModel,
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
    estado: {
      type: DataTypes.ENUM(...ESTADOS_HITO),
      allowNull: false,
      defaultValue: 'ABIERTO',
    },
    fechaCierre: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'fecha_cierre',
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
    modelName: 'Hito',
    tableName: 'hitos',
    timestamps: true,
    underscored: true,
  },
);

HitoModel.belongsTo(CampaniaModel, { foreignKey: 'campaniaId', as: 'campania' });

registerModel(HitoModel);
