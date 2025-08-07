const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryTransaction = sequelize.define(
  'InventoryTransaction',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('in', 'out'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.ENUM('sale', 'restock', 'return', 'damage', 'initial'),
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      field: 'product_id',
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id',
      },
      field: 'order_id',
    },
  },
  {
    tableName: 'inventory_transactions',
    underscored: true,
    timestamps: true,
  }
);

module.exports = InventoryTransaction;
