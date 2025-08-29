import mongoose from "mongoose";
const prioritizeSchema = new mongoose.Schema({
  categoryId: {
    type: String,
    required: true,
    unique: true
  },
  categoryName: {
    type: String,
    required: true
  },
  productIds: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true
});

const Prioritize = mongoose.model('Prioritized Model', prioritizeSchema);
export default Prioritize;