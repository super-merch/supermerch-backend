import mongoose from "mongoose";

const favouriteSchema = mongoose.Schema({
    userId: { type: String, required: true },
    favouriteProducts: { type: Array, required: true }
})

const favouriteModel = mongoose.models.favoruite || mongoose.model('favoruite', favouriteSchema)

export default favouriteModel;