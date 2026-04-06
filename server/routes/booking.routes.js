const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const auth = require('../middleware/auth.middleware');

// @route   POST api/bookings/check
router.post('/check', auth, bookingController.checkAvailability);

// @route   POST api/bookings
router.post('/', auth, bookingController.createBooking);

// @route   GET api/bookings/me
router.get('/me', auth, bookingController.getMyBookings);

module.exports = router;
