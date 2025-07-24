import mongoose from "mongoose";

const addCategoryMargin = new mongoose.Schema({
  supplierId: { type: String, required: true },
  supplierName : { type: String, required: true },
  categoryId: { type: String, required: true },
  categoryName: { type: String, required: true },
  margin: { type: Number, required: true },

  
});

const categoryMarginModal = mongoose.model('addCategoryMargin', addCategoryMargin);

export default categoryMarginModal;
