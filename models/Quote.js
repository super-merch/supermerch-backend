import mongoose from 'mongoose';

const quote = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    match: [/.+@.+\..+/, 'Please enter a valid email address'],
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  delivery: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    default: 'None',
  },
  product:{
    type: String,
    required: true
  },
  productId:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true  // Add this to automatically create createdAt and updatedAt fields
});

export default mongoose.model("Quote" ,quote)