const { successResponse, errorResponse } = require('../utils/responseHandler');
const slugify = require('slugify');
const { Product, Category, Review } = require('../models');
const { Op } = require('sequelize');

exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const slug = slugify(productData.name);
    console.log('product slugifiied');
    const product = await Product.create({
      ...productData,
      slug: slug,
    });
    console.log('product created');
    return successResponse(
      res,
      { product },
      'Product created successfully.',
      201
    );
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, error.message, 422);
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    // const products = await ProductService.findAll(req.query);
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = req.query;
    const options = {
      where: {
        isActive: true,
      },
      include: [{ model: Category, as: 'category' }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };
    if (search) {
      options.where.name = { [Op.iLike]: `%${search}%` }; // Case-insensitive search
    }
    if (categoryId) {
      options.where.categoryId = categoryId;
    }
    if (minPrice) {
      options.where.price = {
        ...options.where.price,
        [Op.gte]: parseFloat(minPrice),
      };
    }
    if (maxPrice) {
      options.where.price = {
        ...options.where.price,
        [Op.lte]: parseFloat(maxPrice),
      };
    }

    // Use findAndCountAll for accurate pagination data
    const { count, rows } = await Product.findAndCountAll(options);

    const products = {
      products: rows,
      totalProducts: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page, 10),
    };

    return successResponse(
      res,
      { products },
      'Products retrieved successfully.'
    );
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve products.');
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    // const product = await ProductService.findById(id);

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category', // Alias must match the association definition
        },
        {
          model: Review,
          as: 'reviews',
          include: ['user'], // Example of nested include to get the user of the review
        },
      ],
    });

    if (!product) {
      return errorResponse(res, 'Product not found.', 404);
    }

    return successResponse(res, { product }, 'Product retrieved successfully.');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve product.');
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    console.log('in update');

    // const updatedProduct = await ProductService.update(id, productData);
    const product = await Product.findByPk(id);
    if (product) {
      if (productData.name && productData.name !== product.name) {
        productData.slug = slugify(productData.name);
      }
      console.log('about to update');

      await product.update(productData);
      return successResponse(
        res,
        { product: product },
        'Product updated successfully.'
      );
    }
    console.log('product not found');
    return errorResponse(
      res,
      'Product not found or could not be updated.',
      404
    );
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, error.message, 422);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // const result = await ProductService.softDelete(id);
    let result;

    const product = await Product.findByPk(id);
    if (!product) {
      return errorResponse(res, 'Product not found.', 404);
    }
    product.isActive = false;
    await product.save();

    return successResponse(res, null, 'Product has been deactivated.');
  } catch (error) {
    return errorResponse(res, 'Failed to delete product.');
  }
};
