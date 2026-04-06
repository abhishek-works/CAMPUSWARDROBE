const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  renter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collegeID: { type: String, required: true, index: true },
  type: { type: String, enum: ['hourly', 'nightly'], required: true },
  timeSlot: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  totalPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending','confirmed','active','completed','cancelled'], default: 'pending' },
  meetingPass: {
    code: { type: String, default: '' },
    qrData: { type: String, default: '' },
    isRedeemed: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

bookingSchema.index({ product: 1, 'timeSlot.start': 1, 'timeSlot.end': 1 });
bookingSchema.index({ renter: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
