import ProductDiscount from "../models/ProductDiscount.js";
import Admin from '../models/Admin.js'
import bcrypt from "bcryptjs";
import GlobalDiscount from "../models/GlobalDiscount.js";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import GlobalMargin from '../models/globalMargin.js'

export const addGlobalDiscount = async (req, res) => {
  const { discount } = req.body;

  if (discount === undefined || discount < 0 || discount > 100) {
    return res.status(400).json({ 
      message: 'Discount percentage is required and must be between 0 and 100' 
    });
  }

  try {
    // Remove all existing individual product discounts
    await ProductDiscount.deleteMany({});

    // Remove any existing global discount
    await GlobalDiscount.deleteMany({});

    // Create new global discount
    const newGlobalDiscount = new GlobalDiscount({
      discount,
      isActive: true
    });

    await newGlobalDiscount.save();

    return res.status(201).json({
      message: 'Global discount added successfully. All individual product discounts have been removed.',
      data: newGlobalDiscount,
    });
  } catch (error) {
    console.error('Error adding global discount:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get current global discount
export const getGlobalDiscount = async (req, res) => {
  try {
    const globalDiscount = await GlobalDiscount.findOne({ isActive: true });
    
    if (!globalDiscount) {
      return res.status(200).json({
        message: "No global discount active",
        data: { discount: 0, isActive: false }
      });
    }
    // console.log(globalDiscount)

    return res.status(200).json({
      message: "Global discount fetched successfully",
      data: globalDiscount
    });
  } catch (error) {
    console.error("Error fetching global discount:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Remove global discount
export const removeGlobalDiscount = async (req, res) => {
  try {
    await GlobalDiscount.deleteMany({});
    
    return res.status(200).json({
      message: "Global discount removed successfully"
    });
  } catch (error) {
    console.error("Error removing global discount:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const addGlobalMargin = async (req, res) => {
  const { margin } = req.body;

  if (margin === undefined || margin < 0) {
    return res.status(400).json({ 
      message: 'Margin amount is required and must be 0 or greater' 
    });
  }

  try {
    // Remove all existing individual product margins (if you have ProductMargin model)
    // await ProductMargin.deleteMany({});

    // Remove any existing global margin
    await GlobalMargin.deleteMany({});

    // Create new global margin
    const newGlobalMargin = new GlobalMargin({
      margin: parseFloat(margin),
      isActive: true
    });

    await newGlobalMargin.save();

    return res.status(201).json({
      message: 'Global margin added successfully. All individual product margins have been removed.',
      data: newGlobalMargin,
    });
  } catch (error) {
    console.error('Error adding global margin:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get current global margin
export const getGlobalMargin = async (req, res) => {
  try {
    const globalMargin = await GlobalMargin.findOne({ isActive: true });
    
    if (!globalMargin) {
      return res.status(200).json({
        message: "No global margin active",
        data: { margin: 0, isActive: false }
      });
    }

    return res.status(200).json({
      message: "Global margin fetched successfully",
      data: globalMargin
    });
  } catch (error) {
    console.error("Error fetching global margin:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Remove global margin
export const removeGlobalMargin = async (req, res) => {
  try {
    await GlobalMargin.deleteMany({});
    
    return res.status(200).json({
      message: "Global margin removed successfully"
    });
  } catch (error) {
    console.error("Error removing global margin:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
// export const addDiscount = async (req, res) => {

//   const { productId, discount, basePrice } = req.body;

//   if (!productId || discount === undefined || !basePrice) {
//     return res
//       .status(400)
//       .json({ message: "Product ID, discount, and base price are required" });
//   }

//   try {
//     const discountPrice = basePrice - (basePrice * discount) / 100;
//     const existingDiscount = await ProductDiscount.findOne({ productId });

//     if (existingDiscount) {
//       // Update the discount and discount price
//     // const discountPrice = basePrice - (basePrice * discount) / 100;

//     const discountAmount = (basePrice * discount) / 100;
//     const discountPrice = basePrice - discountAmount;
//     const existingDiscount = await ProductDiscount.findOne({ productId });

//     if (existingDiscount) {
//       existingDiscount.discount = discount;
//       existingDiscount.discountPrice = discountPrice;
//       await existingDiscount.save();
//       return res.status(200).json({
//         message: "Discount updated successfully",
//         data: existingDiscount,
//       });
//     }

//     // Create a new discount entry
//     const newDiscount = new ProductDiscount({
//       productId,
//       discount,
//       discountPrice,
//     });
//     await newDiscount.save();
//     res.status(201).json({
//       message: "Discount added successfully",
//       data: newDiscount,
//     });
//   } catch (error) {
//     console.error("Error adding discount:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// }
export const addDiscount = async (req, res) => {
  const { productId, discount, basePrice } = req.body;

  if (!productId || discount === undefined || !basePrice) {
    return res
      .status(400)
      .json({ message: 'Product ID, discount, and base price are required' });
  }

  try {
    // Check if global discount is active
    const globalDiscount = await GlobalDiscount.findOne({ isActive: true });
    
    if (globalDiscount) {
      return res.status(200).json({
        status:'global',
        message: `Cannot add product discount. Global discount of ${globalDiscount.discount}% is active. Please remove global discount first.`
      });
    }

    const discountAmount = (basePrice * discount) / 100;
    const discountPrice = basePrice - discountAmount;

    const existingDiscount = await ProductDiscount.findOne({ productId });

    if (existingDiscount) {
      existingDiscount.discount = discount;
      existingDiscount.discountPrice = discountPrice;
      await existingDiscount.save();
      return res.status(200).json({
        message: 'Discount updated successfully',
        data: existingDiscount,
      });
    }

    // Create a new discount entry
    const newDiscount = new ProductDiscount({
      productId,
      discount,
      discountPrice,
    });
    await newDiscount.save();

    return res.status(201).json({
      message: 'Discount added successfully',
      data: newDiscount,
    });
  } catch (error) {
    console.error('Error adding discount:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Updated function to get discount - checks global discount first
export const getDiscountByProductId = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    // First check if global discount is active
    const globalDiscount = await GlobalDiscount.findOne({ isActive: true });
    
    if (globalDiscount) {
      // If global discount is active, return it for all products
      return res.status(200).json({
        message: "Global discount active",
        data: { 
          productId, 
          discount: globalDiscount.discount, 
          discountPrice: 0, // You'll calculate this on frontend
          isGlobal: true
        }
      });
    }

    // If no global discount, check for individual product discount
    let searchQuery;
    
    if (!isNaN(productId)) {
      searchQuery = {
        $or: [
          { productId: productId },
          { productId: parseInt(productId) },
          { productId: Number(productId) }
        ]
      };
    } else {
      searchQuery = { productId: productId };
    }

    const discount = await ProductDiscount.findOne(searchQuery);

    if (!discount) {
      return res.status(200).json({
        message: "No discount for this product",
        data: { productId, discount: 0, discountPrice: 0, isGlobal: false }
      });
    }

    return res.status(200).json({
      message: "Discount fetched successfully",
      data: { ...discount.toObject(), isGlobal: false }
    });

  } catch (error) {
    console.error("Error in getDiscountByProductId:", error);
    return res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
function applyDiscountToPrice(price, discountPercentage) {
  if (!discountPercentage || discountPercentage === 0) return price;
  return price - (price * discountPercentage / 100);
}

// Helper function to apply discount to all prices in a product
function applyDiscountToProduct(product, discountPercentage) {
  if (!discountPercentage || discountPercentage === 0) return product;
  
  // Deep clone to avoid modifying original
  const processedProduct = JSON.parse(JSON.stringify(product));
  
  // Recursive function to process any object
  function processObject(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => processObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const processed = {};
      
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'price' && typeof value === 'number') {
          // Apply discount to price fields
          processed[key] = applyDiscountToPrice(value, discountPercentage);
        } else if (key === 'setup' && typeof value === 'number') {
          // Apply discount to setup costs
          processed[key] = applyDiscountToPrice(value, discountPercentage);
        } else if (key === 'price_breaks' && Array.isArray(value)) {
          // Handle price breaks array
          processed[key] = value.map(priceBreak => ({
            ...priceBreak,
            price: applyDiscountToPrice(priceBreak.price, discountPercentage)
          }));
        } else if (key.toLowerCase().includes('price') && typeof value === 'number') {
          // Handle any other price-related fields
          processed[key] = applyDiscountToPrice(value, discountPercentage);
        } else {
          // Recursively process nested objects
          processed[key] = processObject(value);
        }
      }
      
      return processed;
    }
    
    return obj;
  }
  
  return processObject(processedProduct);
}

// Helper function to get discount for a product
async function getProductDiscount(productId) {
  try {
    // First check if global discount is active
    const globalDiscount = await GlobalDiscount.findOne({ isActive: true });
    
    if (globalDiscount) {
      return {
        discount: globalDiscount.discount,
        isGlobal: true
      };
    }

    // If no global discount, check for individual product discount
    let searchQuery;
    
    if (!isNaN(productId)) {
      searchQuery = {
        $or: [
          { productId: productId },
          { productId: parseInt(productId) },
          { productId: Number(productId) }
        ]
      };
    } else {
      searchQuery = { productId: productId };
    }

    const productDiscount = await ProductDiscount.findOne(searchQuery);
    
    if (productDiscount) {
      return {
        discount: productDiscount.discount,
        isGlobal: false
      };
    }

    return {
      discount: 0,
      isGlobal: false
    };
  } catch (error) {
    console.error('Error getting product discount:', error);
    return {
      discount: 0,
      isGlobal: false
    };
  }
}



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS  // Your Gmail App Password
  }
});

// Updated login function
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin in database
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { email: admin.email, role: "admin", id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      token,
      email: admin.email,
      message: "Login successful!",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send OTP for password change
export const sendOTP = async (req, res) => {
  try {
    const admin = await Admin.findOne({});
    
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiry (5 minutes)
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    
    // Update admin with OTP
    admin.otp = otp;
    admin.otpExpires = otpExpires;
    await admin.save();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: 'Password Change OTP',
      text: `Your OTP for password change is: ${otp}. This OTP will expire in 5 minutes.`
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "OTP sent to your email"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP and change password
export const changePassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    const admin = await Admin.findOne({});
    
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Check if OTP exists and is not expired
    if (!admin.otp || !admin.otpExpires || admin.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired or invalid" });
    }

    // Verify OTP
    if (admin.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear OTP
    admin.password = hashedPassword;
    admin.otp = null;
    admin.otpExpires = null;
    await admin.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const listDiscount = async (req, res) => {
  try {
    const discounts = await ProductDiscount.find({});
    res.status(200).json({ success: true, discounts });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
