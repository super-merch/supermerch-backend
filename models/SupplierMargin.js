
import mongoose from "mongoose";

const supplierMargin = new mongoose.Schema({
  supplierId: { type: String, required: true, unique: true },
  margin: { type: Number, required: true, default: 0 },
});

const supplierMarginModel = mongoose.model('supplierMargin', supplierMargin);

export default supplierMarginModel;
