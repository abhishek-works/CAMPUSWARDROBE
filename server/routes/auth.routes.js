const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authController = require('../controllers/auth.controller');
const domainValidator = require('../middleware/domainValidator');
const auth = require('../middleware/auth.middleware');

// @route   POST api/auth/register
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('collegeId', 'Please select a college').not().isEmpty()
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, domainValidator, authController.registerUser);

// @route   POST api/auth/login
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, authController.loginUser);

// @route   GET api/auth/me
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;
