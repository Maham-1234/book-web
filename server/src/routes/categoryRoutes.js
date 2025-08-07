const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const validate = require('../middleware/validation');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const {
  createCategoryRequestSchema,
  updateCategoryRequestSchema,
  integerIdParamSchema,
} = require('../zod-schemas');

router.get('/', categoryController.getAllCategories);

router.get(
  '/:id',
  validate({ params: integerIdParamSchema }),
  categoryController.getCategoryById
);

router.post(
  '/',
  isAuthenticated,
  isAdmin,
  validate({ body: createCategoryRequestSchema }),
  categoryController.createCategory
);
router.put(
  '/:id',
  isAuthenticated,
  isAdmin,
  validate({ params: integerIdParamSchema, body: updateCategoryRequestSchema }),
  categoryController.updateCategory
);
router.delete(
  '/:id',
  isAuthenticated,
  isAdmin,
  validate({ params: integerIdParamSchema }),
  categoryController.deleteCategory
);
module.exports = router;
