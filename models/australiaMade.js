import mongoose from "mongoose";

const australiaMade = new mongoose.Schema({
    id: [{ type: String, required: true }],
});

export default mongoose.model("AustraliaMade", australiaMade);