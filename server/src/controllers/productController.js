const { successResponse, errorResponse } = require('../utils/responseHandler');
const slugify = require('slugify');
const {
  Product,
  Category,
  Review,
  InventoryTransaction,
  sequelize,
} = require('../models');
const { Op } = require('sequelize');
const path = require('path');

exports.createProduct = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const productData = req.body;
    const slug = slugify(productData.name);

    const product = await Product.create(
      {
        ...productData,
        slug: slug,
      },
      { transaction: t }
    );

    if (product.stock && product.stock > 0) {
      await InventoryTransaction.create(
        {
          productId: product.id,
          type: 'in',
          quantity: product.stock,
          reason: 'initial',
        },
        { transaction: t }
      );
    }

    await t.commit();

    return successResponse(
      res,
      { product },
      'Product created successfully.',
      201
    );
  } catch (error) {
    await t.rollback();
    console.log(error.message);
    return errorResponse(res, error.message, 422);
  }
};
exports.uploadProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return errorResponse(res, 'Product not found.', 404);
    }

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'No images uploaded.', 400);
    }

    const imageUrls = req.files.map((file) => {
      const imagePath = path
        .join('uploads', 'products', product.id.toString(), file.filename)
        .replace(/\\/g, '/');
      return `${req.protocol}://${req.get('host')}/${imagePath}`;
    });

    const updatedImages = product.images
      ? [...product.images, ...imageUrls]
      : imageUrls;

    await product.update({ images: updatedImages });

    return successResponse(
      res,
      { product },
      'Images uploaded and product updated successfully.'
    );
  } catch (error) {
    console.error(error.message);
    return errorResponse(res, 'Failed to upload images.', 500);
  }
};
exports.updateProduct = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const productData = req.body;

    const product = await Product.findByPk(id, { transaction: t });

    if (!product) {
      await t.commit();
      return errorResponse(res, 'Product not found.', 404);
    }

    const originalStock = product.stock;

    if (productData.name && productData.name !== product.name) {
      productData.slug = slugify(productData.name);
    }

    await product.update(productData, { transaction: t });

    const newStock = productData.stock;
    if (newStock !== undefined && newStock !== originalStock) {
      const quantityChange = newStock - originalStock;

      let transactionRecord;

      if (quantityChange > 0) {
        transactionRecord = {
          productId: product.id,
          type: 'in',
          quantity: quantityChange,
          reason: 'restock',
        };
      } else {
        transactionRecord = {
          productId: product.id,
          type: 'out',
          quantity: Math.abs(quantityChange),
          reason: 'damage',
        };
      }

      await InventoryTransaction.create(transactionRecord, { transaction: t });
    }

    await t.commit();

    return successResponse(
      res,
      { product: product },
      'Product updated successfully.'
    );
  } catch (error) {
    await t.rollback();
    console.log(error.message);
    return errorResponse(res, error.message, 422);
  }
};

async function getDescendantCategoryIds(startCategoryId) {
  const numericStartId = parseInt(startCategoryId, 10);
  if (isNaN(numericStartId)) {
    return [];
  }

  const allIds = [numericStartId];
  const queue = [numericStartId];

  while (queue.length > 0) {
    const currentId = queue.shift();

    const children = await Category.findAll({
      where: { parentId: currentId },
      attributes: ['id'],
    });

    const childIds = children.map((child) => child.id);

    if (childIds.length > 0) {
      allIds.push(...childIds);
      queue.push(...childIds);
    }
  }

  return allIds;
}

exports.getAllProducts = async (req, res) => {
  try {
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
    console.log(`\n--- Product Fetch Start ---`);
    console.log(
      `Received categoryId from query:`,
      categoryId,
      `(Type: ${typeof categoryId})`
    );

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
      options.where.name = { [Op.iLike]: `%${search}%` };
    }
    if (categoryId) {
      console.log('entered categoryId: ', categoryId);
      const categoryIdsToInclude = await getDescendantCategoryIds(categoryId);
      console.log('categoryIdsToInclude: ', categoryIdsToInclude);
      options.where.categoryId = {
        [Op.in]: categoryIdsToInclude,
      };
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

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
        },
        {
          model: Review,
          as: 'reviews',
          include: ['user'],
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

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
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
