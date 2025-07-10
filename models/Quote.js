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
});

export default mongoose.model("Quote" ,quote)