const { prisma } = require('../config/db');

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

    const product = await prisma.product.create({
      data: {
        ownerId: req.user.id,
        collegeDomain: req.user.collegeID, // Scoped to user's college domain
        title,
        description: description || "",
        category,
        size,
        brand: brand || "",
        color: color || "",
        condition: condition || "good",
        hourlyPrice: pricing.hourly,
        nightlyPrice: pricing.nightly,
        tags,
        images
      }
    });

    // Increment user listings count
    await prisma.user.update({
      where: { id: req.user.id },
      data: { totalListings: { increment: 1 } }
    });

    // The frontend might expect product structure slightly different (e.g., pricing.hourly).
    // Let's format it for frontend compatibility:
    const formattedProduct = {
      ...product,
      pricing: { hourly: product.hourlyPrice, nightly: product.nightlyPrice }
    };

    res.json(formattedProduct);
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
    const whereClause = { 
      collegeDomain: req.user.collegeID,
      availability: 'available' 
    };

    if (category) whereClause.category = category;
    if (size) whereClause.size = size;

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { name: true, profilePic: true, ratingAverage: true, ratingCount: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit)
    });

    // Format output mapping for frontend backward compatibility
    const formattedProducts = products.map(p => ({
      ...p,
      pricing: { hourly: p.hourlyPrice, nightly: p.nightlyPrice },
      owner: {
        ...p.owner,
        ratings: { average: p.owner.ratingAverage, count: p.owner.ratingCount }
      }
    }));

    res.json(formattedProducts);
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
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: { id: true, name: true, profilePic: true, ratingAverage: true, ratingCount: true, bio: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    if (product.collegeDomain !== req.user.collegeID) {
      return res.status(403).json({ msg: 'Unauthorized to view products outside your campus' });
    }

    const formattedProduct = {
      ...product,
      pricing: { hourly: product.hourlyPrice, nightly: product.nightlyPrice },
      owner: {
        ...product.owner,
        _id: product.owner.id, // Support _id dependency in frontend
        ratings: { average: product.owner.ratingAverage, count: product.owner.ratingCount }
      }
    };

    res.json(formattedProduct);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error fetching product details');
  }
};

// @route   GET api/products/me
// @desc    Get logged in user's own products (Merchant Dashboard)
// @access  Private
exports.getMyProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    const formattedProducts = products.map(p => ({
      ...p,
      pricing: { hourly: p.hourlyPrice, nightly: p.nightlyPrice }
    }));

    res.json(formattedProducts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error fetching your products');
  }
};
