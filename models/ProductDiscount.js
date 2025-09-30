import mongoose from 'mongoose';

const ProductDiscountSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.Mixed, // Allows both String and Number
    required: true,
    index: true // Add index for better performance
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  discountPrice: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Add compound index for better query performance
ProductDiscountSchema.index({ productId: 1 });

export default mongoose.model('ProductDiscount', ProductDiscountSchema);