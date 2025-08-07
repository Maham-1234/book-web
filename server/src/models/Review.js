const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define(
  'Review',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isVerifiedPurchase: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified_purchase',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'user_id',
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
  },
  {
    tableName: 'reviews',
    underscored: true,
    timestamps: true,
  }
);

module.exports = Review;
