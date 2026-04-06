const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require('../middleware/auth.middleware');
const { parser } = require('../utils/cloudinary'); // Multer middleware

// @route   POST api/products
// multipart/form-data support, max 5 images
router.post('/', auth, parser.array('images', 5), productController.createProduct);

// @route   GET api/products/me
// MUST be before /:id path
router.get('/me', auth, productController.getMyProducts);

// @route   GET api/products
router.get('/', auth, productController.getProducts);

// @route   GET api/products/:id
router.get('/:id', auth, productController.getProductById);

module.exports = router;
