import mongoose from "mongoose";

const arrival = new mongoose.Schema({
  productId: { type: String, required: true, unique: true }, // Changed from 'id' to 'productId'
});

const arrivalModel = mongoose.model('Arrivals', arrival);

export default arrivalModel;