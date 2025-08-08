import mongoose from "mongoose";

const shipping = new mongoose.Schema({
  shipping: { type: Number},
});

const shippingModel = mongoose.model('shippingModel', shipping);

export default shippingModel;
