import mongoose from "mongoose";

const orderCommentSchema = new mongoose.Schema({
  OrderId: { type: String, required: true, unique: true },
  comments: [{ type: String, required: true }],
}, { timestamps: true });  // optional but useful

const OrderComment = mongoose.model("OrderComment", orderCommentSchema);

export default OrderComment;
