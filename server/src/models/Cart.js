const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, 
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "carts",
  }
);
module.exports = Cart;
