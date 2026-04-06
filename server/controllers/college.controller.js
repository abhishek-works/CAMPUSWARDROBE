const College = require('../models/College');

// @route   GET api/colleges
// @desc    Search colleges by name
// @access  Public
exports.searchColleges = async (req, res) => {
  try {
    const q = req.query.q;
    let colleges;

    if (q) {
      // Basic regex search for autocomplete
      colleges = await College.find({ 
        name: { $regex: q, $options: 'i' },
        isActive: true
      }).select('name domain location logoUrl').limit(10);
    } else {
      // Return top colleges by student count or default
      colleges = await College.find({ isActive: true })
        .sort({ studentCount: -1 })
        .select('name domain location logoUrl')
        .limit(20);
    }

    res.json(colleges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/colleges/:id
// @desc    Get college by ID
// @access  Public
exports.getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({ msg: 'College not found' });
    }

    res.json(college);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'College not found' });
    }
    res.status(500).send('Server Error');
  }
};
