import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    unique: true
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('EmailTemplate', emailTemplateSchema);