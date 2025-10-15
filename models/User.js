import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Username is required"],
    minlength: [4, "Username must be at least 4 characters long"],
    maxlength: [20, "Username must not exceed 20 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"],

  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetCode: {
    type: String,
    default: undefined
  },
  resetCodeExpiry: {
    type: Date,
    default: undefined
  },
  defaultAddress: { type: Object, default: {} },
  defaultShippingAddress: { type: Object, default: {} },
}
  , {
    timestamps: true
  });



const User = mongoose.model("User", userSchema);

export default User;
