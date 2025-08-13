const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Product } = require('../models');
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
      if (!product) {
        return cb(new Error('Product not found for image upload.'), false);
      }
      const dir = path.join(process.cwd(), 'uploads', 'products', id);

      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'File upload error: Only the following filetypes are allowed - ' +
          allowedTypes
      ),
      false
    );
  }
};

const productImageUpload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
  fileFilter: fileFilter,
});

module.exports = productImageUpload;
