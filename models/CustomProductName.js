import mongoose from "mongoose";

const customProductNameSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  customName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
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

export const CustomProductName = mongoose.model('CustomProductName', customProductNameSchema);