const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const validate = require("../middleware/validation");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const {
  createOrderRequestSchema,
  orderParamsSchema,
} = require("../zod-schemas");

router.use(isAuthenticated);

router.post(
  "/",
  validate({ body: createOrderRequestSchema }),
  orderController.createOrder
);

router.get("/", orderController.getUserOrders);

router.get(
  "/:orderId",
  validate({ params: orderParamsSchema }),
  orderController.getOrderById
);

router.get("/admin/all", isAdmin, orderController.getAllOrders);

router.put(
  "/admin/:orderId/status",
  isAdmin,
  validate({ params: orderParamsSchema }),
  orderController.updateOrderStatus
);

module.exports = router;
