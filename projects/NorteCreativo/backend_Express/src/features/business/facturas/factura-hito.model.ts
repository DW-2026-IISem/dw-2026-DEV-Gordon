import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Model } from 'sequelize';
import { sequelize } from '../../../database/db';

export class FacturaHito extends Model<InferAttributes<FacturaHito>, InferCreationAttributes<FacturaHito>> {
  declare id: CreationOptional<number>;
  declare factura_id: number;
  declare hito_id: number;
  declare valor: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

FacturaHito.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    factura_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'facturas', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    hito_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'hitos', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    valor: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      validate: { isDecimal: true, min: 0 },
      get() {
        return Number(this.getDataValue('valor') as unknown);
      },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'factura_hitos',
    timestamps: true,
    // Un hito no se repite dentro de la misma factura.
    indexes: [{ unique: true, name: 'uq_factura_hitos_factura_hito', fields: ['factura_id', 'hito_id'] }],
  }
);
