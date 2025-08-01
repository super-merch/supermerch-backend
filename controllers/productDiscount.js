import ProductDiscount from "../models/ProductDiscount.js";
// import Admin from '../models/Admin.js'
// import bcrypt from "bcryptjs";
import GlobalDiscount from "../models/GlobalDiscount.js";
import jwt from "jsonwebtoken";

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
