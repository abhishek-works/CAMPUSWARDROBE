const express = require('express');
const router = express.Router();
const collegeController = require('../controllers/college.controller');

// @route   GET api/colleges
router.get('/', collegeController.searchColleges);

// @route   GET api/colleges/:id
router.get('/:id', collegeController.getCollegeById);

module.exports = router;
