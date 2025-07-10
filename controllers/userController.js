import express from "express";
// import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import validator from "validator";



const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};


const getUser = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("email");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ success: true, email: user.email });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
};


// Route for user Login-----------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    console.log(user, "user");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User doesn't exist" });
    }

    // Log the password and hashed password for debugging
    console.log("Input Password:", password);
    console.log("Stored Hashed Password:", user.password);

    // Compare passwords
    const exist = await bcrypt.compare(password, user.password);
    console.log(exist, "isMatch");

    if (exist) {
      const token = createToken(user._id);
      res.json({ success: true, user, token });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Route for user Registration---------------------------
const signUpUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(name, email, password);

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    if (name.length < 4) {
      return res
        .status(400)
        .json({ success: false, message: "Username must be at least 4 characters long" });
    }

    // Validate email and password
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a strong password" });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed Password:", hashedPassword); // Log the hashed password

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      user,
      message: "Account Created Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Update User
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  console.log(name, id, email, "update");
  console.log(name.length, "length");

  if (name.length > 20) {
    return res.status(401).json({ error: "Name should be leass than 20 char" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error updating user" });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

export const saveAddress = async (req, res) => {
  try {
    const { defaultAddress } = req.body;
    const { userId } = req.body; 

    const user = await User.findByIdAndUpdate(
      userId,
      { defaultAddress },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getWebUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const updateWebUser = async (req, res) => {
  try {
    const { userId, name, email, currentPassword, newPassword } = req.body;

    console.log(req.body, "Request Body");
    // Find the user by ID
    const user = await User.findById(userId);
    console.log(user,"user")
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    } 
    console.log(user.password, "Stored Hashed Password");
    console.log(currentPassword, "Provided Current Password");

    // Compare currentPassword with the stored hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log(isMatch, "Password Match Status");

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid current password" });
    }

    // Update name and email if provided
    user.name = name || user.name;
    user.email = email || user.email;

    // Update password if newPassword is provided
    if (newPassword) {
      console.log(newPassword, "New Password");
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Save the updated user
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);

    // Handle any unexpected errors
    return res
      .status(500)
      .json({ success: false, message: "Error updating user" });
  }
};



export { getAllUsers, signUpUser, loginUser, updateUser, deleteUser, getUser };
