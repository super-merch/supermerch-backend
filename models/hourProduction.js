import mongoose from "mongoose";

const hourProduction24 = new mongoose.Schema({
    id: { type: String, required: true }
});

export default mongoose.model("HourProduction24", hourProduction24);