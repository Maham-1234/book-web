const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cart = sequelize.define(
  'Cart',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      filed: 'user_id',
    },
  },
  {
    tableName: 'carts',
    timestamps: true,
    underscored: true,
  }
);
module.exports = Cart;
