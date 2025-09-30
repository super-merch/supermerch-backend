import mongoose from "mongoose"

const userQuery = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    title: {type: String, required:true},
    message: { type: String, required: true },
    type: { type: String, required: true },
    createdAt :{
        type: Date,
        default: Date.now
    }
})

export default mongoose.model("UserQuery", userQuery);  