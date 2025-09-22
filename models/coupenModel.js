import mongoose from "mongoose";

const coupen = new mongoose.Schema({
  coupen: { type: String},
  discount: { type: Number},
  isActive: { type: Boolean, default: true }, // New field for activation/deactivation
});

const coupenModel = mongoose.model('coupenModel', coupen);

export default coupenModel;