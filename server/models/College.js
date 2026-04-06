const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  domain: { type: String, required: true, unique: true },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true }
  },
  logoUrl: { type: String, default: '' },
  studentCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

collegeSchema.index({ name: 'text' });

module.exports = mongoose.model('College', collegeSchema);
