import mongoose from "mongoose";

const customProductNameSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  customName: String,
  originalName: String,
  customDesc: String,
  originalDesc: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const CustomProductName = mongoose.model('CustomProductName', customProductNameSchema);
