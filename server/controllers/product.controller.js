const Product = require('../models/Product');
const User = require('../models/User');

// @route   POST api/products
// @desc    Create a product (requires auth + multipart form data)
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    const { title, description, category, size, brand, color, condition, pricingStr, tagsStr } = req.body;
    
    // Parse JSON strings from FormData
    const pricing = pricingStr ? JSON.parse(pricingStr) : { hourly: null, nightly: null };
    const tags = tagsStr ? JSON.parse(tagsStr) : [];
    
    // Get image URLs from Cloudinary multer parser
    const images = req.files ? req.files.map(file => file.path) : [];

    const newProduct = new Product({
      owner: req.user.id,
      collegeID: req.user.collegeID, // Scoped to user's college domain
      title,
      description,
      category,
      size,
      brand,
      color,
      condition,
      pricing,
      availability: 'available',
      tags,
      images
    });

    const product = await newProduct.save();

    // Increment user listings count
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalListings: 1 } });

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error in creating product');
  }
};

// @route   GET api/products
// @desc    Get all products for the current user's college
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    const { category, size, limit = 20, page = 1 } = req.query;
    
    // Filter by user's campusID automatically!
    const query = { 
      collegeID: req.user.collegeID,
      availability: 'available' 
    };

    if (category) query.category = category;
    if (size) query.size = size;

    const products = await Product.find(query)
      .populate('owner', 'name profilePic ratings') // Populate owner basic details
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error fetching products');
  }
};

// @route   GET api/products/:id
// @desc    Get a single product by ID
// @access  Private
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('owner', 'name profilePic ratings bio');

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Ensure user is seeing a product from their own college
    if (product.collegeID !== req.user.collegeID) {
      return res.status(403).json({ msg: 'Unauthorized to view products outside your campus' });
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error fetching product details');
  }
};

// @route   GET api/products/me
// @desc    Get logged in user's own products (Merchant Dashboard)
// @access  Private
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error fetching your products');
  }
};
