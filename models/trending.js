import mongoose from "mongoose";

const trending = new mongoose.Schema({
  productId: { type: String, required: true, unique: true }, // Changed from 'id' to 'productId'
});

const trendingModel = mongoose.model('Trending', trending);

export default trendingModel;