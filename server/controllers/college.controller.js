const { prisma } = require('../config/db');

// @route   GET api/colleges
// @desc    Search colleges by name
// @access  Public
exports.searchColleges = async (req, res) => {
  try {
    const q = req.query.q;
    let colleges;

    if (q) {
      colleges = await prisma.college.findMany({
        where: {
          name: { contains: q, mode: 'insensitive' },
          isActive: true
        },
        select: { id: true, name: true, domain: true, city: true, state: true, logoUrl: true },
        take: 10
      });
    } else {
      colleges = await prisma.college.findMany({
        where: { isActive: true },
        orderBy: { studentCount: 'desc' },
        select: { id: true, name: true, domain: true, city: true, state: true, logoUrl: true },
        take: 20
      });
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
    const college = await prisma.college.findUnique({
      where: { id: req.params.id }
    });

    if (!college) {
      return res.status(404).json({ msg: 'College not found' });
    }

    res.json(college);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
