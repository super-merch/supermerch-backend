import mongoose from "mongoose";

const addMargin = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  margin: { type: Number, required: true, default: 0 },
  marginPrice: { type: Number, default: 0 },
});

const addMarginModel = mongoose.model('addMargin', addMargin);

export default addMarginModel;
