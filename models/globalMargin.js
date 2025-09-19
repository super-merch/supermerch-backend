// models/GlobalMargin.js
import mongoose from 'mongoose';

const globalMarginSchema = new mongoose.Schema({
  margin: {
    type: Number,
    required: true,
    min: 0
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
globalMarginSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('GlobalMargin', globalMarginSchema);