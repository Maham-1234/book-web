const { successResponse, errorResponse } = require("../utils/responseHandler");
const { Cart, CartItem, Product } = require("../models");
const { sequelize } = require("../models");

const getCartByUserId = async (userId) => {
  let cart = await Cart.findOne({ where: { user_id: userId } });

  if (!cart) {
    cart = await Cart.create({ user_id: userId });
  }

  return await Cart.findOne({
    where: { user_id: userId },
    defaults: { user_id: userId },
    include: [
      {
        model: CartItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product"
          },
        ],
      },
    ],
    order: [[{ model: CartItem, as: "items" }, "createdAt", "ASC"]],
  });
  return cart;
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await getCartByUserId(userId);
    return successResponse(res, { cart }, "Cart retrieved successfully.");
  } catch (error) {
    console.error(error); // Log the actual error for debugging
    return errorResponse(res, "Failed to retrieve cart.", 500);
  }
};

const addItemToCart = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    const product = await Product.findByPk(product_id);
    if (!product || !product.isActive) {
      return errorResponse(
        res,
        "Product not found or is currently unavailable.",
        404
      );
    }

    if (product.stock < quantity) {
      return errorResponse(
        res,
        "Not enough stock available for this product.",
        422
      );
    }

    const cart = await getCartByUserId(userId);
    console.log("cart", cart);
    let cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.id,
        product_id: product_id,
      },
      transaction: t,
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return errorResponse(
          res,
          "Adding this quantity would exceed available stock.",
          422
        );
      }
      cartItem.quantity = newQuantity;
      await cartItem.save({ transaction: t });
    } else {
      cartItem = await CartItem.create(
        {
          cart_id: cart.id,
          product_id: product_id,
          quantity: quantity,
        },
        { transaction: t }
      );
    }

    await t.commit();

    const updatedCart = await getCartByUserId(userId);
    return successResponse(
      res,
      { cart: updatedCart },
      "Item added to cart successfully.",
      201
    );
  } catch (error) {
    await t.rollback();
    console.error(error);
    return errorResponse(
      res,
      error.message || "Failed to add item to cart.",
      422
    );
  }
};

const updateCartItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return removeCartItem(req, res);
    }

    const cartItem = await CartItem.findByPk(itemId, {
      include: [
        { model: Product, as: "product" },
        { model: Cart, as: "cart" },
      ],
    });

    if (!cartItem || cartItem.cart.user_id !== userId) {
      return errorResponse(res, "Cart item not found.", 404);
    }

    if (cartItem.product.stock < quantity) {
      return errorResponse(
        res,
        "Not enough stock available for this quantity.",
        422
      );
    }

    cartItem.quantity = quantity;
    await cartItem.save({ transaction: t });

    await t.commit();

    const updatedCart = await getCartByUserId(userId);
    return successResponse(
      res,
      { cart: updatedCart },
      "Cart item updated successfully."
    );
  } catch (error) {
    await t.rollback();
    console.error(error);
    return errorResponse(
      res,
      error.message || "Failed to update cart item.",
      422
    );
  }
};

const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const cartItem = await CartItem.findByPk(itemId, { include: ["cart"] });

    if (!cartItem || cartItem.cart.user_id !== userId) {
      return errorResponse(res, "Cart item not found.", 404);
    }

    await cartItem.destroy();
    const updatedCart = await getCartByUserId(userId);
    return successResponse(
      res,
      { cart: updatedCart },
      "Item removed from cart successfully."
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to remove item from cart.", 500);
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (cart) {
      await CartItem.destroy({
        where: { cart_id: cart.id },
      });
    }
    return successResponse(res, null, "Cart has been cleared.");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to clear cart.", 500);
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  clearCart,
  removeCartItem,
};
