const sequelize = require("../config/database");
const User = require("./User");
const Category = require("./Category");
const Product = require("./Product");
const Cart = require("./Cart");
const CartItem = require("./CartItem");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Review = require("./Review");
const InventoryTransaction = require("./InventoryTransaction");

//a user can have one cart and a cart can belong to one user
User.hasOne(Cart, { foreignKey: "userId", as: "cart" });
Cart.belongsTo(User, { foreignKey: "userId", as: "user" });

// a user can have many order but an order belongs to one user
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

//a user can write many reviews but a review can be written by one user
User.hasMany(Review, { foreignKey: "userId", as: "reviews" });
Review.belongsTo(User, { foreignKey: "userId", as: "user" });

//a category can have many products but a product belongs to only one category
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

//a category can have many sub-categories but a sub-category can have only one parent category
Category.hasMany(Category, { as: "children", foreignKey: "parentId" });
Category.belongsTo(Category, { as: "parent", foreignKey: "parentId" });

//a product can have many reviews but a review belongs to only one product
Product.hasMany(Review, { foreignKey: "productId", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "productId", as: "product" });

//a product can have many inventory transaction but an inventory transaction can have only one product associated with it
Product.hasMany(InventoryTransaction, {
  foreignKey: "productId",
  as: "inventoryTransactions",
});
InventoryTransaction.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

//a cart has many cart items (each which is associated with a product) -> a cart can have many products
Cart.belongsToMany(Product, {
  through: CartItem,
  foreignKey: "cartId",
  as: "products",
});
//a product can be included in many cart items -> a product can belong to many carts
Product.belongsToMany(Cart, {
  through: CartItem,
  foreignKey: "productId",
  as: "carts",
});
//a cart has many cart items and a cart item belongs to one card
Cart.hasMany(CartItem, { foreignKey: "cartId", as: "items" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });
//a product can be included in many cart items but each cart items is associated with one product
Product.hasMany(CartItem, { foreignKey: "productId" });
CartItem.belongsTo(Product, { foreignKey: "productId" });

//order has many products and a product can be in many orders
Order.belongsToMany(Product, {
  through: OrderItem,
  foreignKey: "orderId",
  as: "products",
});
Product.belongsToMany(Order, {
  through: OrderItem,
  foreignKey: "productId",
  as: "orders",
});

//order has many order items
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
//order items belongs to a particular order and a particular product
OrderItem.belongsTo(Order, { foreignKey: "orderId" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

// An order can trigger multiple inventory transactions (one for each item)
Order.hasMany(InventoryTransaction, {
  foreignKey: "orderId",
  as: "inventoryMovements",
});
InventoryTransaction.belongsTo(Order, { foreignKey: "orderId", as: "order" });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Review,
  InventoryTransaction,
};
