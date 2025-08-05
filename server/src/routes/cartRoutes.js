const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const validate = require("../middleware/validation");
const { isAuthenticated } = require("../middleware/auth");

const {
  addItemRequestSchema,
  updateItemRequestSchema,
  cartItemParamsSchema,
} = require("../zod-schemas");

router.use(isAuthenticated);

router.get("/",isAuthenticated, cartController.getCart);

router.post(
  "/items",
  validate({ body: addItemRequestSchema }),
  cartController.addItemToCart
);

router.put(
  "/items/:itemId",
  validate({ params: cartItemParamsSchema, body: updateItemRequestSchema }),
  cartController.updateCartItem
);

router.delete(
  "/items/:itemId",
  validate({ params: cartItemParamsSchema }),
  cartController.removeCartItem
);

router.delete("/", cartController.clearCart);

module.exports = router;
