import mongoose from "mongoose";

const bestSellers = new mongoose.Schema({
  productId: { type: String, required: true, unique: true }, // Changed from 'id' to 'productId'
});

const BestSellerModel = mongoose.model('Best Sellers', bestSellers);

export default BestSellerModel;