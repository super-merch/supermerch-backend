import mongoose from "mongoose";

const marginSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  margin: { type: Number, required: true, default: 0 }, // Default discount is 0%
  marginPrice: { type: Number, default: 0 }, 
  
});

const productMarginModel = mongoose.model("productMargin", marginSchema);

export default productMarginModel;
