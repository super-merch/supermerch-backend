import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  supplierId:   { type: String, required: true },
  categoryId:   { type: String, required: true },
  categoryName: { type: String, required: true },
});

// only this index!
categorySchema.index(
  { supplierId: 1, categoryId: 1 },
  { unique: true }
);

const supCategory = mongoose.model("supCategories", categorySchema);
export default supCategory;
