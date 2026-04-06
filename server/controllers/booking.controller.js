const Booking = require('../models/Booking');
const Product = require('../models/Product');
const { generateRandomCode, generateQRCodeURI } = require('../utils/generateQR');

// @route   POST api/bookings/check
// @desc    Check availability and calculate price
// @access  Private
exports.checkAvailability = async (req, res) => {
  try {
    const { productId, start, end, type } = req.body; // type = 'hourly', 'nightly'
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    const requestedStart = new Date(start);
    const requestedEnd = new Date(end);

    // Overlap Check Algorithm:
    // startNew < endExisting AND endNew > startExisting
    const conflict = await Booking.findOne({
      product: productId,
      status: { $nin: ['cancelled', 'completed'] },
      'timeSlot.start': { $lt: requestedEnd },
      'timeSlot.end': { $gt: requestedStart }
    });

    if (conflict) {
      return res.status(409).json({ available: false, msg: 'Time slot overlaps with an existing booking' });
    }

    // Calculate Price
    const durationMs = requestedEnd - requestedStart;
    let totalPrice = 0;

    if (type === 'hourly') {
      const hours = Math.ceil(durationMs / (1000 * 60 * 60));
      totalPrice = product.pricing.hourly * hours;
    } else if (type === 'nightly') {
      const nights = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
      // if nights < 1 but booked overnight, default to 1
      totalPrice = product.pricing.nightly * (nights === 0 ? 1 : nights);
    }

    res.json({ available: true, totalPrice });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error checking availability');
  }
};

// @route   POST api/bookings
// @desc    Create a new booking and generate Meeting Pass
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { productId, start, end, type, totalPrice } = req.body;

    const product = await Product.findById(productId);

    if (product.owner.toString() === req.user.id) {
        return res.status(400).json({ msg: 'You cannot rent your own item' });
    }

    // Generate Meeting Pass Details
    // In a real app with payments, this happens AFTER successful payment
    // For MVP we mock payment and auto-confirm
    const meetingCode = generateRandomCode(6);
    
    const newBooking = new Booking({
      product: productId,
      renter: req.user.id,
      owner: product.owner,
      collegeID: req.user.collegeID,
      type,
      timeSlot: { start: new Date(start), end: new Date(end) },
      totalPrice,
      status: 'confirmed', // Assuming Instant confirmation MVP
    });

    await newBooking.save();

    // Increment bookings count
    await Product.findByIdAndUpdate(productId, { $inc: { totalBookings: 1 } });

    // Generate QR using booking ID and meetingCode
    const qrPayload = {
      bookingId: newBooking._id,
      code: meetingCode,
      product: product.title
    };
    
    newBooking.meetingPass.code = meetingCode;
    newBooking.meetingPass.qrData = await generateQRCodeURI(qrPayload);
    await newBooking.save();
    
    // Populate necessary fields before return
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('product', 'title images brand')
      .populate('owner', 'name phone profilePic');

    res.json(populatedBooking);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error creating booking');
  }
};

// @route   GET api/bookings/me
// @desc    Get user's past and active bookings (As renter AND owner)
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        const rentals = await Booking.find({ renter: req.user.id })
            .populate('product', 'title images brand size')
            .populate('owner', 'name profilePic')
            .sort({ createdAt: -1 });
            
        const lentOut = await Booking.find({ owner: req.user.id })
            .populate('product', 'title images pricing')
            .populate('renter', 'name profilePic')
            .sort({ createdAt: -1 });

        res.json({ rentals, lentOut });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error fetching bookings');
    }
};
