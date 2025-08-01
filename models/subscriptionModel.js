
import mongoose from "mongoose";

const subscription = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
});

const subscriptionModel = mongoose.model('subscription', subscription);

export default subscriptionModel;
