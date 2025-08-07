const express = require('express');
const router = express.Router();
const validate = require('../middleware/validation');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const productController = require('../controllers/productController');

const {
  createProductRequestSchema,
  updateProductRequestSchema,
  uuidParamSchema,
} = require('../zod-schemas');

router.get('/', productController.getAllProducts);

router.get(
  '/:id',
  validate({ param: uuidParamSchema }),
  productController.getProductById
);

router.post(
  '/',
  isAuthenticated,
  isAdmin,
  validate({ body: createProductRequestSchema }),
  productController.createProduct
);

router.put(
  '/:id',
  isAuthenticated,
  isAdmin,
  validate({ param: uuidParamSchema, body: updateProductRequestSchema }),
  productController.updateProduct
);

router.delete(
  '/:id',
  isAuthenticated,
  isAdmin,
  validate({ param: uuidParamSchema }),
  productController.deleteProduct
);

module.exports = router;
