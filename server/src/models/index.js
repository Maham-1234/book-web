const sequelize = require("../config/database");
const User = require("./User");
const Category = require("./Category");
const Product = require("./Product");
const Cart = require("./Cart");
const CartItem = require("./CartItem");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Review = require("./Review");

//a user can have one cart and a cart can belong to one user
User.hasOne(Cart, { foreignKey: "user_id", as: "cart" });
Cart.belongsTo(User, { foreignKey: "user_id", as: "user" });

// a user can have many order but an order belongs to one user
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

//a user can write many reviews but a review can be written by one user
User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });
Review.belongsTo(User, { foreignKey: "user_id", as: "user" });

//a category can have many products but a product belongs to only one category
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

//a category can have many sub-categories but a sub-category can have only one parent category
Category.hasMany(Category, { as: "children", foreignKey: "parentId" });
Category.belongsTo(Category, { as: "parent", foreignKey: "parentId" });

//a product can have many reviews but a review belongs to only one product
Product.hasMany(Review, { foreignKey: "product_id", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "product_id", as: "product" });

//a cart has many cart items (each which is associated with a product) -> a cart can have many products
Cart.belongsToMany(Product, {
  through: CartItem,
  foreignKey: "cart_id",
  as: "products",
});
//a product can be included in many cart items -> a product can belong to many carts
Product.belongsToMany(Cart, {
  through: CartItem,
  foreignKey: "product_id",
  as: "carts",
});
//a cart has many cart items and a cart item belongs to one card
Cart.hasMany(CartItem, { foreignKey: "cart_id", as: "items" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id", as: "cart" });
//a product can be included in many cart items but each cart items is associated with one product
Product.hasMany(CartItem, { foreignKey: "product_id" });
CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

//order has many products and a product can be in many orders
Order.belongsToMany(Product, {
  through: OrderItem,
  foreignKey: "order_id",
  as: "products",
});
Product.belongsToMany(Order, {
  through: OrderItem,
  foreignKey: "product_id",
  as: "orders",
});

//order has many order items
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
//order items belongs to a particular order and a particular product
OrderItem.belongsTo(Order, { foreignKey: "order_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

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
};
