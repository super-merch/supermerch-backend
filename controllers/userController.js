import express from "express";
// import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import validator from "validator";
import nodemailer from 'nodemailer';




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
  const { 
    page = 1, 
    limit = 15, 
    search = '', 
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  try {
    // Build query filters
    let query = {};
    
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Handle search (similar to orders)
    if (search) {
      // Fetch all users for search filtering
      const allUsers = await User.find({}, "-password")
        .populate('defaultAddress')
        .sort(sortObj);
      
      const filteredUsers = allUsers.filter(user => {
        const userName = (user.name || '').toLowerCase();
        const userEmail = (user.email || '').toLowerCase();
        const userPhone = (user?.defaultAddress?.phone || '').toLowerCase();
        const searchLower = search.toLowerCase();
        
        return userName.includes(searchLower) || 
               userEmail.includes(searchLower) || 
               userPhone.includes(searchLower);
      });

      const paginatedUsers = filteredUsers.slice(skip, skip + parseInt(limit));
      const totalUsers = filteredUsers.length;

      return res.status(200).json({ 
        success: true, 
        data: paginatedUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          hasNextPage: parseInt(page) < Math.ceil(totalUsers / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      });
    }

    // Execute query with pagination (no search)
    const users = await User.find(query, "-password")
      .populate('defaultAddress')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalUsers,
        hasNextPage: parseInt(page) < Math.ceil(totalUsers / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Error fetching users" });
  }
};


// Route for user Login-----------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

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
    console.log(user, "user")
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
        .status(400)
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

// Generate random 6-digit code
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Step 1: Check user and send reset code
export const checkUser = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    // Generate reset code and expiry time (60 seconds from now)
    const resetCode = generateResetCode();
    const resetCodeExpiry = new Date(Date.now() + 600 * 1000); // 60 seconds

    // Save reset code and expiry to user
    user.resetCode = resetCode;
    user.resetCodeExpiry = resetCodeExpiry;
    await user.save();

    // In a real application, you would send email here
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Super Merch-Reset Password`,
      html:
        `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; content: center " >
        <h2>Reset Password code: ${resetCode}</h2>
        <p>Use this code to reset your password. It will expire in 10 minutes.</p>
      <div/>`}
    console.log(`Reset code for ${email}: ${resetCode}`);
    await transporter.sendMail(mailOptions);

    // For demo purposes, we're returning success without actually sending email
    res.json({
      success: true,
      message: "Reset code sent to your email",
      // Remove this in production - only for testing
      resetCode: resetCode
    });

  } catch (error) {
    console.error("Error in checkUser:", error);
    return res.status(500).json({
      success: false,
      message: error.message,    // <-- or error.toString()
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }

};

// Step 2: Verify reset code
export const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    // Check if code exists and hasn't expired
    if (!user.resetCode || !user.resetCodeExpiry) {
      return res.json({
        success: false,
        message: "No reset code found. Please request a new one."
      });
    }

    if (new Date() > user.resetCodeExpiry) {
      // Code expired, clear it
      user.resetCode = undefined;
      user.resetCodeExpiry = undefined;
      await user.save();

      return res.json({
        success: false,
        message: "Reset code has expired. Please request a new one."
      });
    }

    if (user.resetCode !== code) {
      return res.json({
        success: false,
        message: "Invalid reset code"
      });
    }

    // Code is valid
    res.json({
      success: true,
      message: "Code verified successfully"
    });

  } catch (error) {
    console.error("Error in verifyResetCode:", error);
    res.json({
      success: false,
      message: "Error verifying code"
    });
  }
};

// Step 3: Reset password
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    // Validate password
    if (!newPassword || newPassword.length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    // Verify code one more time
    if (!user.resetCode || user.resetCode !== code || new Date() > user.resetCodeExpiry) {
      return res.json({
        success: false,
        message: "Invalid or expired reset code"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset code
    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.json({
      success: false,
      message: "Error resetting password"
    });
  }
};


export { getAllUsers, signUpUser, loginUser, updateUser, deleteUser, getUser };