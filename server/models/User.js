const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  college: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  collegeID: { type: String, required: true, index: true },
  profilePic: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 300 },
  phone: { type: String, default: '' },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  totalListings: { type: Number, default: 0 },
  totalRentals: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
