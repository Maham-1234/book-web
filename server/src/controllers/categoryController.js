const { successResponse, errorResponse } = require('../utils/responseHandler');
const slugify = require('slugify');
const { Category, Product } = require('../models');
const { all } = require('../router');

exports.createCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    const slug = slugify(categoryData.name);

    const category = await Category.create({
      ...categoryData,
      slug: slug,
    });

    return successResponse(
      res,
      { category },
      'Category created successfully.',
      201
    );
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return errorResponse(
        res,
        'A category with this name already exists.',
        409
      );
    }
    return errorResponse(res, error.message, 422);
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.findAll({ raw: true });

    const categoryMap = new Map();
    allCategories.forEach((category) => {
      category.children = [];
      categoryMap.set(category.id, category);
    });

    const categoryTree = [];
    allCategories.forEach((category) => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(category);
        }
      } else {
        categoryTree.push(category);
      }
    });

    return successResponse(
      res,
      { categoryTree },
      'Categories retrieved successfully.'
    );
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 'Failed to retrieve categories.');
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      include: [{ model: Category, as: 'children' }],
    });
    if (!category) {
      return errorResponse(res, 'Category not found.', 404);
    }
    return successResponse(
      res,
      { category },
      'Category retrieved successfully.'
    );
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve category.');
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = req.body;
    const category = await Category.findByPk(id);
    if (!category) {
      return errorResponse(res, 'Category not found.', 404);
    }
    if (categoryData.parentId && categoryData.parentId === id) {
      return errorResponse(res, 'A category cannot be its own parent.', 400);
    }

    if (categoryData.name && categoryData.name !== category.name) {
      categoryData.slug = slugify(categoryData.name);
    }

    await category.update(categoryData);

    return successResponse(
      res,
      { category: category },
      'Category updated successfully.'
    );
  } catch (error) {
    return errorResponse(res, error.message, 422);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const hasChildren = await Category.findOne({ where: { parentId: id } });
    if (hasChildren) {
      throw new Error(
        'Cannot delete a category that has subcategories. Please move or delete them first.'
      );
    }

    const hasProducts = await Product.findOne({ where: { categoryId: id } });
    if (hasProducts) {
      throw new Error(
        'Cannot delete a category that contains products. Please re-assign them first.'
      );
    }

    const deletedRowCount = await Category.destroy({ where: { id } });

    if (deletedRowCount === 0) {
      throw new Error('Category not found.');
    }

    return successResponse(res, null, 'Category deleted successfully.');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
