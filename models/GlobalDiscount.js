// models/GlobalDiscount.js
import mongoose from 'mongoose';

const globalDiscountSchema = new mongoose.Schema({
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
globalDiscountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('GlobalDiscount', globalDiscountSchema);