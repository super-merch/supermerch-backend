import ProductDiscount from "../models/ProductDiscount.js";
// import Admin from '../models/Admin.js'
// import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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


export const getDiscountByProductId = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    // Handle both string and numeric productId
    let searchQuery;
    
    // If productId is a valid number, try both string and number queries
    if (!isNaN(productId)) {
      searchQuery = {
        $or: [
          { productId: productId }, // as string
          { productId: parseInt(productId) }, // as number
          { productId: Number(productId) } // as number (alternative)
        ]
      };
    } else {
      // If not a number, search as string only
      searchQuery = { productId: productId };
    }

    const discount = await ProductDiscount.findOne(searchQuery);

    if (!discount) {
      return res.status(200).json({
        message: "No discount for this product",
        data: { productId, discount: 0, discountPrice: 0 }
      });
    }

    return res.status(200).json({
      message: "Discount fetched successfully",
      data: discount
    });

  } catch (error) {
    console.error("Error in getDiscountByProductId:", error);
    console.error("ProductId received:", productId);
    console.error("Error details:", error.message);
    return res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};






// API  For admin Logins
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { email: process.env.ADMIN_EMAIL, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      res.json({
        success: true,
        token,
        email: process.env.ADMIN_EMAIL,
        message: "Login successful!",
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid Credientials" });
    }
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
