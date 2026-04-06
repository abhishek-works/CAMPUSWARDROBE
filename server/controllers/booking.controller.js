const { prisma } = require('../config/db');
const { generateRandomCode, generateQRCodeURI } = require('../utils/generateQR');

// @route   POST api/bookings/check
// @desc    Check availability and calculate price
// @access  Private
exports.checkAvailability = async (req, res) => {
  try {
    const { productId, start, end, type } = req.body; // type = 'hourly', 'nightly'
    
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    const requestedStart = new Date(start);
    const requestedEnd = new Date(end);

    // Overlap Check Algorithm:
    // startNew < endExisting AND endNew > startExisting
    const conflict = await prisma.booking.findFirst({
      where: {
        productId: productId,
        status: { notIn: ['cancelled', 'completed'] },
        startTime: { lt: requestedEnd },
        endTime: { gt: requestedStart }
      }
    });

    if (conflict) {
      return res.status(409).json({ available: false, msg: 'Time slot overlaps with an existing booking' });
    }

    // Calculate Price
    const durationMs = requestedEnd - requestedStart;
    let totalPrice = 0;

    if (type === 'hourly') {
      const hours = Math.ceil(durationMs / (1000 * 60 * 60));
      totalPrice = (product.hourlyPrice || 0) * hours;
    } else if (type === 'nightly') {
      const nights = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
      totalPrice = (product.nightlyPrice || 0) * (nights === 0 ? 1 : nights);
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

    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (product.ownerId === req.user.id) {
        return res.status(400).json({ msg: 'You cannot rent your own item' });
    }

    const meetingCode = generateRandomCode(6);
    
    let newBooking = await prisma.booking.create({
      data: {
        productId: productId,
        renterId: req.user.id,
        ownerId: product.ownerId,
        collegeDomain: req.user.collegeID,
        type,
        startTime: new Date(start),
        endTime: new Date(end),
        totalPrice,
        status: 'confirmed',
        meetingPassCode: meetingCode
      }
    });

    // Increment bookings count
    await prisma.product.update({
      where: { id: productId },
      data: { totalBookings: { increment: 1 } }
    });

    // Generate QR using booking ID and meetingCode
    const qrPayload = {
      bookingId: newBooking.id,
      code: meetingCode,
      product: product.title
    };
    
    const qrData = await generateQRCodeURI(qrPayload);

    newBooking = await prisma.booking.update({
      where: { id: newBooking.id },
      data: { meetingPassQrData: qrData },
      include: {
        product: { select: { title: true, images: true, brand: true } },
        owner: { select: { name: true, phone: true, profilePic: true } }
      }
    });

    // Match expected structure for frontend: meetingPass: { code, qrData }
    const formattedBooking = {
      ...newBooking,
      meetingPass: { code: newBooking.meetingPassCode, qrData: newBooking.meetingPassQrData },
      timeSlot: { start: newBooking.startTime, end: newBooking.endTime }
    };

    res.json(formattedBooking);

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
        const rentals = await prisma.booking.findMany({
            where: { renterId: req.user.id },
            include: {
                product: { select: { title: true, images: true, brand: true, size: true } },
                owner: { select: { name: true, profilePic: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
            
        const lentOut = await prisma.booking.findMany({
            where: { ownerId: req.user.id },
            include: {
                product: { select: { title: true, images: true, hourlyPrice: true, nightlyPrice: true } },
                renter: { select: { name: true, profilePic: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // format to match original frontend expectations natively
        const formatBooking = (b) => ({
            ...b,
            meetingPass: { code: b.meetingPassCode, qrData: b.meetingPassQrData },
            timeSlot: { start: b.startTime, end: b.endTime },
            product: b.product ? {
              ...b.product,
              pricing: { hourly: b.product.hourlyPrice, nightly: b.product.nightlyPrice }
            } : null
        });

        res.json({ 
            rentals: rentals.map(formatBooking), 
            lentOut: lentOut.map(formatBooking) 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error fetching bookings');
    }
};
