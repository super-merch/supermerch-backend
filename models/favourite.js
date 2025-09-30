import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true,
        index: true // Add index for better query performance
    },
    favouriteProducts: { 
        type: Array, 
        required: true,
        default: []
    }
}, {
    timestamps: true // Add createdAt and updatedAt fields
});

// Fixed typo in model name
const favouriteModel = mongoose.models.favourite || mongoose.model('favourite', favouriteSchema);

export default favouriteModel;