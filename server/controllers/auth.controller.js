const { prisma } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
exports.registerUser = async (req, res) => {
  const { name, email, password, collegeId, collegeDomain } = req.body; // updated for new domainValidator logic probably, or we just map it

  // fallback if domainValidator uses collegeID still
  const colDomain = collegeDomain || req.body.collegeID;

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        collegeId: collegeId,
        collegeDomain: colDomain,
      }
    });

    // Increment student count in College doc
    await prisma.college.update({
      where: { id: collegeId },
      data: { studentCount: { increment: 1 } }
    });

    const payload = {
      user: {
        id: user.id,
        collegeID: user.collegeDomain // keeping token payload consistent logically with existing frontend expectations
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, collegeID: user.collegeDomain } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        collegeID: user.collegeDomain
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, collegeID: user.collegeDomain } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        college: {
          select: { name: true, domain: true }
        }
      }
    });
    
    if (user) {
      delete user.password; // do not return password hash
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
