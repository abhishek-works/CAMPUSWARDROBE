const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collegeID: { type: String, required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: '', maxlength: 500 },
  images: [{ type: String }],
  category: { type: String, enum: ['ethnic','western','formals','sportswear','accessories','footwear','costumes'], required: true },
  size: { type: String, enum: ['XS','S','M','L','XL','XXL','Free Size'], required: true },
  brand: { type: String, default: '', trim: true },
  color: { type: String, default: '', trim: true },
  condition: { type: String, enum: ['new','like-new','good','fair'], default: 'good' },
  pricing: {
    hourly: { type: Number, min: 0, default: null },
    nightly: { type: Number, min: 0, default: null }
  },
  availability: { type: String, enum: ['available','rented','unlisted'], default: 'available' },
  tags: [{ type: String }],
  totalBookings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

productSchema.index({ collegeID: 1, category: 1, availability: 1 });

module.exports = mongoose.model('Product', productSchema);
