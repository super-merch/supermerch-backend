import mongoose from "mongoose";

const coupen = new mongoose.Schema({
  coupen: { type: String},
  discount: { type: Number},
  
});

const coupenModel = mongoose.model('coupenModel', coupen);

export default coupenModel;
