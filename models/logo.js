import mongoose from "mongoose";

const logoSchema = new mongoose.Schema({
    logo: { type: String, required: true },
});

// Fixed typo in model name
const logoModel =  mongoose.model('Logos', logoSchema);

export default logoModel;