const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'order_number',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount',
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'paid',
        'shipped',
        'delivered',
        'cancelled'
      ),
      defaultValue: 'pending',
    },
    shippingAddress: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'shipping_address',
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'stripe',
      field: 'payment_method',
    },
    stripePaymentId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'stripe_payment_id',
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
  },
  {
    tableName: 'orders',
    underscored: true,
    timestamps: true,
  }
);

Order.addHook('beforeValidate', (order) => {
  order.orderNumber = `ORD-${Date.now()}${Math.random()
    .toString()
    .slice(2, 7)}`;
});

module.exports = Order;
