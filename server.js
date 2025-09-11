import "dotenv/config.js";
import express from "express";
import bodyParser from "body-parser";
// import connectDB from "./config/db";
// const authRoutes = require("./controllers/userController");
import allRoutes from "./routes/index.js";
import cors from "cors";
import "dotenv/config.js";
import connectDB from "./config/db.js";
import axios from "axios";
import connectCloudinary from "./config/cloudinary.js";
import serverless from "serverless-http";
import supplierMarginModel from "./models/SupplierMargin.js";
import { CustomProductName } from "./models/CustomProductName.js";
import { addDiscount, getGlobalDiscount, removeGlobalDiscount } from "./controllers/productDiscount.js";
import { addGlobalDiscount } from "./controllers/productDiscount.js";
import GlobalDiscount from "./models/GlobalDiscount.js";
import ProductDiscount from "./models/ProductDiscount.js";
import addMarginModel from "./models/addMargin.js";
import supCategory from "./models/category.js";
import categoryMarginModal from "./models/categoryMargin.js";
import trendingModel from "./models/trending.js";
import arrivalModel from "./models/arrival.js";
import productDiscount from "./models/ProductDiscount.js";
import BestSellerModel from "./models/bestSellers.js";
import { body } from "express-validator";
import Stripe from "stripe";
import Prioritize from "./models/Prioritize.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
connectDB();
const app = express();

app.use(cors({
  exposedHeaders: ['Cross-Origin-Opener-Policy', 'Cross-Origin-Embedder-Policy']
}));
app.use(express.json({ limit: '50mb' })); // Increase limit as needed
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use(bodyParser.json());
connectCloudinary();


// console.log(process.env.JWT_SECRET);

app.use("/api", allRoutes);

// app.get("/api/client-products", async (req, res) => {
//   try {
//     const response = await axios.get("https://api.promodata.com.au/products", {
//       headers: {
//         "x-auth-token":
//           "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
//       },
//     });
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// });




// Paginate API *********************************************************************
// app.get("/api/client-products", async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 100;
//   const offset = (page - 1) * limit;
//   // console.log(page, "page");
//   // console.log(offset, "offset");

//   try {
//     const response = await axios.get(`https://api.promodata.com.au/products?page=${page}`, {
//       headers: {
//         "x-auth-token": "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
//       },
//       // Pass offset/limit if the API supports it:  
//       // params: { offset, limit }
//     });
//     res.json(response.data);
//     // console.log(response.data, "reponsedata");
//     // response.data.data.map((item, index) => {
//     //   console.log(item.meta, "meta id")
//     // });

//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// });

app.post("/api/supplier/search", async (req, res) => {
  const { searchTerm } = req.body;

  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(`https://api.promodata.com.au/suppliers/search?page=${req.query.page}&items_per_page=${req.query.limit}`,
      {
        search_term: searchTerm
      },
      {
        headers,
      }
    );


    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/supplier-products", async (req, res) => {

  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.get(`https://api.promodata.com.au/suppliers?page=${req.query.page}&items_per_page=${req.query.limit}`, {
      headers,
    });


    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ignore-supplier", async (req, res) => {
  const { supplierId } = req.body;

  try {
    const response = await axios.post(
      "https://api.promodata.com.au/suppliers/ignore",
      { supplier_ids: [supplierId] },
      {
        headers: {
          "x-auth-token":
            "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
        },
      }
    );
    res.json(response.data.description);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/ignored-suppliers", async (req, res) => {
  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };
  try {
    const response = await axios.get(`https://api.promodata.com.au/suppliers/ignored`, {
      headers,
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/unignore-supplier", async (req, res) => {
  const { supplierId } = req.body;
  try {
    const response = await axios.post(
      "https://api.promodata.com.au/suppliers/unignore",
      { supplier_ids: [supplierId] },
      {
        headers: {
          "x-auth-token":
            "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
        },
      }
    );
    res.json(response.data.description);
  } catch (error) {
    console.error("Error unignoring product:", error);
    res.status(500).json({ error: "Failed to unignore product" });
  }
});

app.post('/api/add-discount/add-global-discount', addGlobalDiscount);
app.get('/api/add-discount/global-discount', getGlobalDiscount);
app.delete('/api/add-discount/remove-global-discount', removeGlobalDiscount);


const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
const headers = {
  "x-auth-token": AUTH_TOKEN,
  "Content-Type": "application/json",
};

// Helper: apply flat margin to all price breaks in a product
export function applyMarginToProduct(product, margin) {
  if (!product.product?.prices?.price_groups) return;
  product.product.prices.price_groups.forEach(group => {
    // adjust base_price breaks
    if (group.base_price?.price_breaks) {
      group.base_price.price_breaks = group.base_price.price_breaks.map(pb => ({
        qty: pb.qty,
        price: parseFloat((pb.price + margin).toFixed(2))
      }));
    }
    // adjust additions breaks if present
    if (group.additions) {
      group.additions.forEach(add => {
        if (add.price_breaks) {
          add.price_breaks = add.price_breaks.map(pb => ({
            qty: pb.qty,
            price: parseFloat((pb.price + margin).toFixed(2))
          }));
        }
      });
    }
  });
}


app.get("/api/client-products/supplier", async (req, res) => {
  const { supplier } = req.query;
  const page = parseInt(req.query.page) || 1;

  // Validate supplier parameter
  if (!supplier) {
    return res.status(400).json({ error: "Supplier parameter is required" });
  }

  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    const prodResp = await axios.get(`https://api.promodata.com.au/products?page=${page}`, {
      headers,
    });

    const allProducts = prodResp.data.data || [];


    // Filter by supplier name - your current logic is correct
    const filteredProducts = allProducts.filter(
      (item) => item.supplier?.supplier?.toLowerCase().trim() == supplier?.toLowerCase().trim()
    );

    // Return same response format, just with filtered data
    res.json({
      data: filteredProducts,
    });

  } catch (error) {
    console.error("Error in /api/client-products/supplier:", error);
    res.status(500).json({ error: error.message });
  }
});

export const getCustomNames = async () => {
  try {
    const customNames = await CustomProductName.find();
    const customNamesMap = {};
    customNames.forEach(item => {
      customNamesMap[item.productId] = item.customName;
    });
    return customNamesMap;
  } catch (error) {
    console.error('Error fetching custom names:', error);
    return {};
  }
};

// Helper function to apply custom names to products
export const applyCustomNamesToProducts = (products, customNames) => {
  return products.map(product => {
    const productId = product.meta.id;
    if (customNames[productId]) {
      return {
        ...product,
        overview: {
          ...product.overview,
          name: customNames[productId],
          originalName: product.overview.name // Keep original name for reference
        }
      };
    }
    return product;
  });
};

// API Endpoints

// Get all custom names
app.get("/api/custom-names", async (req, res) => {
  try {
    const customNames = await getCustomNames();
    res.json({ customNames });
  } catch (error) {
    console.error("Error fetching custom names:", error);
    res.status(500).json({ error: "Failed to fetch custom names" });
  }
});

// Update or create custom product name
app.post("/api/update-product-name", async (req, res) => {
  const { productId, customName } = req.body;

  if (!productId || !customName) {
    return res.status(400).json({ error: "Product ID and custom name are required" });
  }

  try {
    // First, get the original product name from the 3rd party API
    const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
    const headers = {
      "x-auth-token": AUTH_TOKEN,
      "Content-Type": "application/json",
    };

    const productResponse = await axios.get(
      `https://api.promodata.com.au/products/${productId}`,
      { headers }
    );

    const originalName = productResponse.data.data.overview.name;

    // Update or create custom name in database
    const updatedCustomName = await CustomProductName.findOneAndUpdate(
      { productId },
      {
        customName,
        originalName,
        updatedAt: new Date()
      },
      {
        upsert: true,
        new: true
      }
    );

    res.json({
      success: true,
      message: "Product name updated successfully",
      customName: updatedCustomName
    });
  } catch (error) {
    console.error("Error updating product name:", error);
    res.status(500).json({ error: "Failed to update product name" });
  }
});

// Delete custom product name (revert to original)
app.delete("/api/custom-name/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    await CustomProductName.findOneAndDelete({ productId });
    res.json({ success: true, message: "Custom name removed successfully" });
  } catch (error) {
    console.error("Error removing custom name:", error);
    res.status(500).json({ error: "Failed to remove custom name" });
  }
});

// Updated client-products endpoint with custom names
export function applyDiscountToPrice(price, discountPercentage) {
  if (!discountPercentage || discountPercentage === 0) return price;
  return price - (price * discountPercentage / 100);
}

// Helper function to apply discount to all prices in a product
export function applyDiscountToProduct(product, discountPercentage) {
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
export async function getProductDiscount(productId) {
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
export function addMarginToAllPrices(product, marginAmount) {
  const processedProduct = JSON.parse(JSON.stringify(product));

  function processObject(obj, parentKey = '') {
    if (Array.isArray(obj)) {
      return obj.map(item => processObject(item, parentKey));
    }

    if (obj && typeof obj === 'object') {
      const processed = {};

      for (const [key, value] of Object.entries(obj)) {
        if (key === 'price' && typeof value === 'number') {
          // Add margin to price fields
          processed[key] = value + marginAmount;
        } else if (key === 'setup' && typeof value === 'number') {
          // Add margin to setup costs
          processed[key] = value + marginAmount;
        } else if (key === 'price_breaks' && Array.isArray(value)) {
          // Only add margin to price_breaks if parent is base_price
          if (parentKey === 'base_price') {
            processed[key] = value.map(priceBreak => ({
              ...priceBreak,
              price: priceBreak.price + marginAmount
            }));
          } else {
            // Don't add margin if parent is additions or any other key
            processed[key] = value;
          }
        } else if (key.toLowerCase().includes('price') && typeof value === 'number') {
          // Handle any other price-related fields
          processed[key] = value + marginAmount;
        } else {
          // Recursively process nested objects, passing the current key as parentKey
          processed[key] = processObject(value, key);
        }
      }

      return processed;
    }

    return obj;
  }

  return processObject(processedProduct);
}
// function addMarginToAllPrices(product, marginAmount) {
//   const processedProduct = JSON.parse(JSON.stringify(product));
//   function processObject(obj) {
//     if (Array.isArray(obj)) {
//       return obj.map(item => processObject(item));
//     }
//     if (obj && typeof obj === 'object') {
//       const processed = {};

//       for (const [key, value] of Object.entries(obj)) {
//         if (key === 'price' && typeof value === 'number') {
//           // Add margin to price fields
//           processed[key] = value + marginAmount;
//         } else if (key === 'setup' && typeof value === 'number') {
//           // Add margin to setup costs
//           processed[key] = value + marginAmount;
//         } else if (key === 'price_breaks' && Array.isArray(value)) {
//           // Handle price breaks array
//           processed[key] = value.map(priceBreak => ({
//             ...priceBreak,
//             price: priceBreak.price + marginAmount
//           }));
//         } else if (key.toLowerCase().includes('price') && typeof value === 'number') {
//           // Handle any other price-related fields
//           processed[key] = value + marginAmount;
//         } else {
//           // Recursively process nested objects
//           processed[key] = processObject(value);
//         }
//       }

//       return processed;
//     }

//     return obj;
//   }

//   return processObject(processedProduct);
// }
// Updated client-products endpoint with discount calculation
app.get("/api/client-products", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const doFilter = req.query.filter !== 'false';
  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    // Fetch products
    const prodResp = await axios.get(`https://api.promodata.com.au/products?page=${page}&items_per_page=${limit}&include_discontinued=false`, {
      headers,
    });

    // Fetch ignored products
    const ignResp = await axios.get(`https://api.promodata.com.au/products/ignored`, {
      headers,
    });

    // Fetch custom names
    const customNames = await getCustomNames();

    // Fetch supplier margins from your database
    const supplierMargins = await supplierMarginModel.find();
    const marginsMap = {};
    supplierMargins.forEach(item => {
      marginsMap[item.supplierId] = item.margin;
    });

    // Fetch category margins from your database
    const categoryMargins = await categoryMarginModal.find();
    const categoryMarginsMap = {};
    categoryMargins.forEach(item => {
      // Create a composite key: supplierId + categoryId
      const key = `${item.supplierId}_${item.categoryId}`;
      categoryMarginsMap[key] = item.margin;
    });

    // Check for global discount
    const globalDiscount = await GlobalDiscount.findOne({ isActive: true });
    const globalDiscountPercentage = globalDiscount ? globalDiscount.discount : 0;

    const ignoredIds = new Set(
      (ignResp.data.data || []).map(item => item.meta.id)
    );

    // Fetch category filters
    const filterCategories = await supCategory.find();

    // Filter out discontinued products early and process all filtering logic together
    const activeProducts = (prodResp.data.data || []).filter(p => !p?.meta?.discontinued);

    // Add category-based filtering to ignored IDs
    if (doFilter && filterCategories.length > 0) {
      for (const category of filterCategories) {
        for (const product of activeProducts) {
          if (product.supplier.supplier_id == category.supplierId &&
            product.product.categorisation.product_type.type_group_id === category.categoryId) {
            ignoredIds.add(product.meta.id);
          }
        }
      }
    }

    // Process products and add margins to ALL price fields
    const processedProducts = await Promise.all(
      activeProducts.map(async (product) => {

        const supplierId = product.supplier?.supplier_id;
        const categoryId = product.product?.categorisation?.product_type?.type_group_id;

        // Get supplier margin
        const supplierMargin = marginsMap[supplierId] || 0;

        // Get category margin using composite key
        const categoryKey = `${supplierId}_${categoryId}`;
        const categoryMargin = categoryMarginsMap[categoryKey] || 0;

        // Total margin is supplier margin + category margin
        const totalMargin = supplierMargin + categoryMargin;

        // Apply total margin to all price-related fields
        let processedProduct = addMarginToAllPrices(product, totalMargin);

        // Then apply discount
        let discountPercentage = globalDiscountPercentage;

        // If no global discount, check for individual product discount
        if (!globalDiscountPercentage) {
          const productDiscountInfo = await getProductDiscount(product.meta.id);
          discountPercentage = productDiscountInfo.discount;
        }

        // Apply discount to all prices
        if (discountPercentage > 0) {
          processedProduct = applyDiscountToProduct(processedProduct, discountPercentage);
        }

        // Add margin and discount metadata to product
        processedProduct.marginInfo = {
          supplierMargin: supplierMargin,
          categoryMargin: categoryMargin,
          totalMargin: totalMargin
        };

        processedProduct.discountInfo = {
          discount: discountPercentage,
          isGlobal: globalDiscountPercentage > 0
        };

        return processedProduct;
      })
    );

    // Apply custom names to products
    const productsWithCustomNames = applyCustomNamesToProducts(processedProducts, customNames);

    if (doFilter) {
      const filteredProducts = productsWithCustomNames.filter(
        p => !ignoredIds.has(p.meta.id)
      );

      res.json({
        ...prodResp.data,
        data: filteredProducts
      });
    } else {
      res.json({
        ...prodResp.data,
        data: productsWithCustomNames,
        ignoredProductIds: Array.from(ignoredIds)
      });
    }

  } catch (error) {
    console.error("Error in /api/client-products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/api/client-products/category", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const doFilter = req.query.filter !== 'false';
  const limit = parseInt(req.query.limit) || 10;
  const category = req.query.category;
  const sort = req.query.sort || '';

  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    // Validate required parameters
    if (!category) {
      return res.status(400).json({ error: "Category parameter is required" });
    }

    // Fetch products with search term
    const prodResp = await axios.post(
      `https://api.promodata.com.au/products/search?page=${page}&items_per_page=${limit}`,
      {
        search_term: category
      },
      { headers }
    );

    // Fetch ignored products
    const ignResp = await axios.get(`https://api.promodata.com.au/products/ignored`, {
      headers,
    });

    // Fetch custom names
    const customNames = await getCustomNames();

    // Fetch supplier margins from your database
    const supplierMargins = await supplierMarginModel.find();
    const marginsMap = {};
    supplierMargins.forEach(item => {
      marginsMap[item.supplierId] = item.margin;
    });

    // Fetch category margins from your database
    const categoryMargins = await categoryMarginModal.find();
    const categoryMarginsMap = {};
    categoryMargins.forEach(item => {
      const key = `${item.supplierId}_${item.categoryId}`;
      categoryMarginsMap[key] = item.margin;
    });

    // Check for global discount
    const globalDiscount = await GlobalDiscount.findOne({ isActive: true });
    const globalDiscountPercentage = globalDiscount ? globalDiscount.discount : 0;

    const ignoredIds = new Set(
      (ignResp.data.data || []).map(item => item.meta.id)
    );

    // Fetch category filters
    const filterCategories = await supCategory.find();

    // Add category-based filtering to ignored IDs
    if (doFilter && filterCategories.length > 0) {
      for (const category of filterCategories) {
        for (const product of prodResp.data.data) {
          if (product.supplier.supplier_id == category.supplierId &&
            product.product.categorisation.product_type.type_group_id === category.categoryId) {
            ignoredIds.add(product.meta.id);
          }
        }
      }
    }

    // Process products and add margins to ALL price fields
    const processedProducts = await Promise.all(
      prodResp.data.data.map(async (product) => {
        const supplierId = product.supplier?.supplier_id;
        const categoryId = product.product?.categorisation?.product_type?.type_group_id;

        // Get supplier margin
        const supplierMargin = marginsMap[supplierId] || 0;

        // Get category margin using composite key
        const categoryKey = `${supplierId}_${categoryId}`;
        const categoryMargin = categoryMarginsMap[categoryKey] || 0;

        // Total margin is supplier margin + category margin
        const totalMargin = supplierMargin + categoryMargin;

        // Apply total margin to all price-related fields
        let processedProduct = addMarginToAllPrices(product, totalMargin);

        // Then apply discount
        let discountPercentage = globalDiscountPercentage;

        // If no global discount, check for individual product discount
        if (!globalDiscountPercentage) {
          const productDiscountInfo = await getProductDiscount(product.meta.id);
          discountPercentage = productDiscountInfo.discount;
        }

        // Apply discount to all prices
        if (discountPercentage > 0) {
          processedProduct = applyDiscountToProduct(processedProduct, discountPercentage);
        }

        // Add margin and discount metadata to product
        processedProduct.marginInfo = {
          supplierMargin: supplierMargin,
          categoryMargin: categoryMargin,
          totalMargin: totalMargin
        };

        processedProduct.discountInfo = {
          discount: discountPercentage,
          isGlobal: globalDiscountPercentage > 0
        };

        return processedProduct;
      })
    );

    // Apply custom names to products
    const productsWithCustomNames = applyCustomNamesToProducts(processedProducts, customNames);

    if (doFilter) {
      const filteredProducts = productsWithCustomNames.filter(
        p => !ignoredIds.has(p.meta.id)
      );

      res.json({
        ...prodResp.data,
        data: filteredProducts
      });
    } else {
      res.json({
        ...prodResp.data,
        data: productsWithCustomNames,
        ignoredProductIds: Array.from(ignoredIds)
      });
    }

  } catch (error) {
    console.error("Error in /api/client-products/category:", error);

    // Provide more specific error messages
    if (error.response) {
      return res.status(error.response.status).json({
        error: "External API error",
        details: error.response.data
      });
    }

    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/api/client-product/category/search", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const doFilter = req.query.filter !== 'false';
  const searchTerm = req.query.searchTerm || '';
  const limit = parseInt(req.query.limit) || 9; // Changed to parse as integer and default to 9

  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };


  try {
    // Fetch products with proper pagination
    const prodResp = await axios.post(`https://api.promodata.com.au/products/search?page=${page}&items_per_page=${limit}&product_type_ids=${req.query?.categoryId}&supplier_id=${req.query?.supplierId || ""}&include_discontinued=false`,
      {
        search_term: searchTerm
      },
      {
        headers,
      });

    // Fetch ignored products
    const ignResp = await axios.get(`https://api.promodata.com.au/products/ignored`, {
      headers,
    });

    // Fetch custom names
    const customNames = await getCustomNames();

    // Fetch supplier margins from your database
    const supplierMargins = await supplierMarginModel.find();
    const marginsMap = {};
    supplierMargins.forEach(item => {
      marginsMap[item.supplierId] = item.margin;
    });

    // Fetch category margins from your database
    const categoryMargins = await categoryMarginModal.find();
    const categoryMarginsMap = {};
    categoryMargins.forEach(item => {
      // Create a composite key: supplierId + categoryId
      const key = `${item.supplierId}_${item.categoryId}`;
      categoryMarginsMap[key] = item.margin;
    });

    // Check for global discount
    const globalDiscount = await GlobalDiscount.findOne({ isActive: true });
    const globalDiscountPercentage = globalDiscount ? globalDiscount.discount : 0;

    const ignoredIds = new Set(
      (ignResp.data.data || []).map(item => item.meta.id)
    );

    // Fetch category filters
    const filterCategories = await supCategory.find();

    // Add category-based filtering to ignored IDs
    if (doFilter && filterCategories.length > 0) {
      for (const category of filterCategories) {
        for (const product of prodResp.data.data) {
          if (product.supplier.supplier_id == category.supplierId &&
            product.product.categorisation.product_type.type_group_id === category.categoryId) {
            ignoredIds.add(product.meta.id);
          }
        }
      }
    }

    // Process products and add margins to ALL price fields
    const processedProducts = await Promise.all(
      prodResp.data.data.map(async (product) => {
        const supplierId = product.supplier?.supplier_id;
        const categoryId = product.product?.categorisation?.product_type?.type_group_id;

        // Get supplier margin
        const supplierMargin = marginsMap[supplierId] || 0;

        // Get category margin using composite key
        const categoryKey = `${supplierId}_${categoryId}`;
        const categoryMargin = categoryMarginsMap[categoryKey] || 0;

        // Total margin is supplier margin + category margin
        const totalMargin = supplierMargin + categoryMargin;

        // Apply total margin to all price-related fields
        let processedProduct = addMarginToAllPrices(product, totalMargin);

        // Then apply discount
        let discountPercentage = globalDiscountPercentage;

        // If no global discount, check for individual product discount
        if (!globalDiscountPercentage) {
          const productDiscountInfo = await getProductDiscount(product.meta.id);
          discountPercentage = productDiscountInfo.discount;
        }

        // Apply discount to all prices
        if (discountPercentage > 0) {
          processedProduct = applyDiscountToProduct(processedProduct, discountPercentage);
        }

        // Add margin and discount metadata to product
        processedProduct.marginInfo = {
          supplierMargin: supplierMargin,
          categoryMargin: categoryMargin,
          totalMargin: totalMargin
        };

        processedProduct.discountInfo = {
          discount: discountPercentage,
          isGlobal: globalDiscountPercentage > 0
        };

        return processedProduct;
      })
    );

    // Apply custom names to products
    const productsWithCustomNames = applyCustomNamesToProducts(processedProducts, customNames);

    if (doFilter) {
      const filteredProducts = productsWithCustomNames.filter(
        p => !ignoredIds.has(p.meta.id)
      );

      res.json({
        ...prodResp.data,
        data: filteredProducts
      });
    } else {
      res.json({
        ...prodResp.data,
        data: productsWithCustomNames,
        ignoredProductIds: Array.from(ignoredIds),
        count: prodResp.data.item_count,
      });
    }

  } catch (error) {
    console.error("Error in /api/client-products/search:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});
app.get("/api/client-products/search", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const doFilter = req.query.filter !== 'false';
  const searchTerm = req.query.searchTerm || '';
  const limit = parseInt(req.query.limit) || 9; // Changed to parse as integer and default to 9

  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };


  try {
    // Fetch products with proper pagination
    const prodResp = await axios.post(`https://api.promodata.com.au/products/search?page=${page}&items_per_page=${limit}&include_discontinued=false`,
      {
        search_term: searchTerm
      },
      {
        headers,
      });

    // Fetch ignored products
    const ignResp = await axios.get(`https://api.promodata.com.au/products/ignored`, {
      headers,
    });

    // Fetch custom names
    const customNames = await getCustomNames();

    // Fetch supplier margins from your database
    const supplierMargins = await supplierMarginModel.find();
    const marginsMap = {};
    supplierMargins.forEach(item => {
      marginsMap[item.supplierId] = item.margin;
    });

    // Fetch category margins from your database
    const categoryMargins = await categoryMarginModal.find();
    const categoryMarginsMap = {};
    categoryMargins.forEach(item => {
      // Create a composite key: supplierId + categoryId
      const key = `${item.supplierId}_${item.categoryId}`;
      categoryMarginsMap[key] = item.margin;
    });

    // Check for global discount
    const globalDiscount = await GlobalDiscount.findOne({ isActive: true });
    const globalDiscountPercentage = globalDiscount ? globalDiscount.discount : 0;

    const ignoredIds = new Set(
      (ignResp.data.data || []).map(item => item.meta.id)
    );

    // Fetch category filters
    const filterCategories = await supCategory.find();

    // Add category-based filtering to ignored IDs
    if (doFilter && filterCategories.length > 0) {
      for (const category of filterCategories) {
        for (const product of prodResp.data.data) {
          if (product.supplier.supplier_id == category.supplierId &&
            product.product.categorisation.product_type.type_group_id === category.categoryId) {
            ignoredIds.add(product.meta.id);
          }
        }
      }
    }

    // Process products and add margins to ALL price fields
    const processedProducts = await Promise.all(
      prodResp.data.data.map(async (product) => {
        const supplierId = product.supplier?.supplier_id;
        const categoryId = product.product?.categorisation?.product_type?.type_group_id;

        // Get supplier margin
        const supplierMargin = marginsMap[supplierId] || 0;

        // Get category margin using composite key
        const categoryKey = `${supplierId}_${categoryId}`;
        const categoryMargin = categoryMarginsMap[categoryKey] || 0;

        // Total margin is supplier margin + category margin
        const totalMargin = supplierMargin + categoryMargin;

        // Apply total margin to all price-related fields
        let processedProduct = addMarginToAllPrices(product, totalMargin);

        // Then apply discount
        let discountPercentage = globalDiscountPercentage;

        // If no global discount, check for individual product discount
        if (!globalDiscountPercentage) {
          const productDiscountInfo = await getProductDiscount(product.meta.id);
          discountPercentage = productDiscountInfo.discount;
        }

        // Apply discount to all prices
        if (discountPercentage > 0) {
          processedProduct = applyDiscountToProduct(processedProduct, discountPercentage);
        }

        // Add margin and discount metadata to product
        processedProduct.marginInfo = {
          supplierMargin: supplierMargin,
          categoryMargin: categoryMargin,
          totalMargin: totalMargin
        };

        processedProduct.discountInfo = {
          discount: discountPercentage,
          isGlobal: globalDiscountPercentage > 0
        };

        return processedProduct;
      })
    );

    // Apply custom names to products
    const productsWithCustomNames = applyCustomNamesToProducts(processedProducts, customNames);

    if (doFilter) {
      const filteredProducts = productsWithCustomNames.filter(
        p => !ignoredIds.has(p.meta.id)
      );

      res.json({
        ...prodResp.data,
        data: filteredProducts
      });
    } else {
      res.json({
        ...prodResp.data,
        data: productsWithCustomNames,
        ignoredProductIds: Array.from(ignoredIds),
        count: prodResp.data.item_count,
      });
    }

  } catch (error) {
    console.error("Error in /api/client-products/search:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/api/client-products-trending", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const doFilter = req.query.filter !== 'false';
  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    // First, get trending product IDs from the database
    const trendingProducts = await trendingModel.find()


    if (trendingProducts.length === 0) {
      return res.json({
        data: [],
        meta: {
          current_page: page,
          total: 0,
          per_page: 10
        }
      });
    }

    // Extract product IDs
    const productIds = trendingProducts.map(item => item.productId); // Adjust field name as per your model

    // Fetch individual products using the specific product API
    const productPromises = productIds.map(id =>
      axios.get(`https://api.promodata.com.au/products/${id}`, { headers })
        .catch(error => {
          console.error(`Error fetching product ${id}:`, error.message);
          return null; // Return null for failed requests
        })
    );

    const productResponses = await Promise.all(productPromises);

    // Filter out failed requests and extract product data
    const fetchedProducts = productResponses
      .filter(response => response !== null)
      .map(response => response.data.data);

    // Fetch ignored products
    const ignResp = await axios.get(`https://api.promodata.com.au/products/ignored`, {
      headers,
    });

    // Fetch custom names
    const customNames = await getCustomNames();

    // Fetch supplier margins from your database
    const supplierMargins = await supplierMarginModel.find();
    const marginsMap = {};
    supplierMargins.forEach(item => {
      marginsMap[item.supplierId] = item.margin;
    });

    // Fetch category margins from your database
    const categoryMargins = await categoryMarginModal.find();
    const categoryMarginsMap = {};
    categoryMargins.forEach(item => {
      // Create a composite key: supplierId + categoryId
      const key = `${item.supplierId}_${item.categoryId}`;
      categoryMarginsMap[key] = item.margin;
    });

    // Check for global discount
    const globalDiscount = await GlobalDiscount.findOne({ isActive: true });
    const globalDiscountPercentage = globalDiscount ? globalDiscount.discount : 0;

    const ignoredIds = new Set(
      (ignResp.data.data || []).map(item => item.meta.id)
    );

    // Fetch category filters
    const filterCategories = await supCategory.find();

    // Add category-based filtering to ignored IDs
    if (doFilter && filterCategories.length > 0) {
      for (const category of filterCategories) {
        for (const product of fetchedProducts) {
          if (product.supplier?.supplier_id == category.supplierId &&
            product.product?.categorisation?.product_type?.type_group_id === category.categoryId) {
            ignoredIds.add(product.meta.id);
          }
        }
      }
    }

    // Process products and add margins to ALL price fields
    const processedProducts = await Promise.all(
      fetchedProducts.map(async (product) => {
        const supplierId = product.supplier?.supplier_id;
        const categoryId = product.product?.categorisation?.product_type?.type_group_id;

        // Get supplier margin
        const supplierMargin = marginsMap[supplierId] || 0;

        // Get category margin using composite key
        const categoryKey = `${supplierId}_${categoryId}`;
        const categoryMargin = categoryMarginsMap[categoryKey] || 0;

        // Total margin is supplier margin + category margin
        const totalMargin = supplierMargin + categoryMargin;

        // Apply total margin to all price-related fields
        let processedProduct = addMarginToAllPrices(product, totalMargin);

        // Then apply discount
        let discountPercentage = globalDiscountPercentage;

        // If no global discount, check for individual product discount
        if (!globalDiscountPercentage) {
          const productDiscountInfo = await getProductDiscount(product.meta.id);
          discountPercentage = productDiscountInfo.discount;
        }

        // Apply discount to all prices
        if (discountPercentage > 0) {
          processedProduct = applyDiscountToProduct(processedProduct, discountPercentage);
        }

        // Add margin and discount metadata to product
        processedProduct.marginInfo = {
          supplierMargin: supplierMargin,
          categoryMargin: categoryMargin,
          totalMargin: totalMargin
        };

        processedProduct.discountInfo = {
          discount: discountPercentage,
          isGlobal: globalDiscountPercentage > 0
        };

        return processedProduct;
      })
    );

    // Apply custom names to products
    const productsWithCustomNames = applyCustomNamesToProducts(processedProducts, customNames);

    // Get total count for pagination
    const totalTrendingCount = await trendingModel.countDocuments();

    if (doFilter) {
      const filteredProducts = productsWithCustomNames.filter(
        p => !ignoredIds.has(p.meta.id)
      );

      res.json({
        data: filteredProducts,
        meta: {
          current_page: page,
          total: totalTrendingCount,
          per_page: 10,
          last_page: Math.ceil(totalTrendingCount / 10)
        }
      });
    } else {
      res.json({
        data: productsWithCustomNames,
        ignoredProductIds: Array.from(ignoredIds),
        meta: {
          current_page: page,
          total: totalTrendingCount,
          per_page: 10,
          last_page: Math.ceil(totalTrendingCount / 10)
        }
      });
    }

  } catch (error) {
    console.error("Error in /api/client-products-trending:", error);
    res.status(500).json({ error: "Failed to fetch trending products" });
  }
});
app.get("/api/client-products-newArrival", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const doFilter = req.query.filter !== 'false';
  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    // First, get trending product IDs from the database
    const trendingProducts = await arrivalModel.find()


    if (trendingProducts.length === 0) {
      return res.json({
        data: [],
        meta: {
          current_page: page,
          total: 0,
          per_page: 10
        }
      });
    }

    // Extract product IDs
    const productIds = trendingProducts.map(item => item.productId); // Adjust field name as per your model

    // Fetch individual products using the specific product API
    const productPromises = productIds.map(id =>
      axios.get(`https://api.promodata.com.au/products/${id}`, { headers })
        .catch(error => {
          console.error(`Error fetching product ${id}:`, error.message);
          return null; // Return null for failed requests
        })
    );

    const productResponses = await Promise.all(productPromises);

    // Filter out failed requests and extract product data
    const fetchedProducts = productResponses
      .filter(response => response !== null)
      .map(response => response.data.data);

    // Fetch ignored products
    const ignResp = await axios.get(`https://api.promodata.com.au/products/ignored`, {
      headers,
    });

    // Fetch custom names
    const customNames = await getCustomNames();

    // Fetch supplier margins from your database
    const supplierMargins = await supplierMarginModel.find();
    const marginsMap = {};
    supplierMargins.forEach(item => {
      marginsMap[item.supplierId] = item.margin;
    });

    // Fetch category margins from your database
    const categoryMargins = await categoryMarginModal.find();
    const categoryMarginsMap = {};
    categoryMargins.forEach(item => {
      // Create a composite key: supplierId + categoryId
      const key = `${item.supplierId}_${item.categoryId}`;
      categoryMarginsMap[key] = item.margin;
    });

    // Check for global discount
    const globalDiscount = await GlobalDiscount.findOne({ isActive: true });
    const globalDiscountPercentage = globalDiscount ? globalDiscount.discount : 0;

    const ignoredIds = new Set(
      (ignResp.data.data || []).map(item => item.meta.id)
    );

    // Fetch category filters
    const filterCategories = await supCategory.find();

    // Add category-based filtering to ignored IDs
    if (doFilter && filterCategories.length > 0) {
      for (const category of filterCategories) {
        for (const product of fetchedProducts) {
          if (product.supplier?.supplier_id == category.supplierId &&
            product.product?.categorisation?.product_type?.type_group_id === category.categoryId) {
            ignoredIds.add(product.meta.id);
          }
        }
      }
    }

    // Process products and add margins to ALL price fields
    const processedProducts = await Promise.all(
      fetchedProducts.map(async (product) => {
        const supplierId = product.supplier?.supplier_id;
        const categoryId = product.product?.categorisation?.product_type?.type_group_id;

        // Get supplier margin
        const supplierMargin = marginsMap[supplierId] || 0;

        // Get category margin using composite key
        const categoryKey = `${supplierId}_${categoryId}`;
        const categoryMargin = categoryMarginsMap[categoryKey] || 0;

        // Total margin is supplier margin + category margin
        const totalMargin = supplierMargin + categoryMargin;

        // Apply total margin to all price-related fields
        let processedProduct = addMarginToAllPrices(product, totalMargin);

        // Then apply discount
        let discountPercentage = globalDiscountPercentage;

        // If no global discount, check for individual product discount
        if (!globalDiscountPercentage) {
          const productDiscountInfo = await getProductDiscount(product.meta.id);
          discountPercentage = productDiscountInfo.discount;
        }

        // Apply discount to all prices
        if (discountPercentage > 0) {
          processedProduct = applyDiscountToProduct(processedProduct, discountPercentage);
        }

        // Add margin and discount metadata to product
        processedProduct.marginInfo = {
          supplierMargin: supplierMargin,
          categoryMargin: categoryMargin,
          totalMargin: totalMargin
        };

        processedProduct.discountInfo = {
          discount: discountPercentage,
          isGlobal: globalDiscountPercentage > 0
        };

        return processedProduct;
      })
    );

    // Apply custom names to products
    const productsWithCustomNames = applyCustomNamesToProducts(processedProducts, customNames);

    // Get total count for pagination
    const totalTrendingCount = await trendingModel.countDocuments();

    if (doFilter) {
      const filteredProducts = productsWithCustomNames.filter(
        p => !ignoredIds.has(p.meta.id)
      );

      res.json({
        data: filteredProducts,
        meta: {
          current_page: page,
          total: totalTrendingCount,
          per_page: 10,
          last_page: Math.ceil(totalTrendingCount / 10)
        }
      });
    } else {
      res.json({
        data: productsWithCustomNames,
        ignoredProductIds: Array.from(ignoredIds),
        meta: {
          current_page: page,
          total: totalTrendingCount,
          per_page: 10,
          last_page: Math.ceil(totalTrendingCount / 10)
        }
      });
    }

  } catch (error) {
    console.error("Error in /api/client-products-trending:", error);
    res.status(500).json({ error: "Failed to fetch trending products" });
  }
});
app.get("/api/client-products-discounted", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const doFilter = req.query.filter !== 'false';
  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    // First, get trending product IDs from the database
    const trendingProducts = await productDiscount.find({ $expr: { $gt: ["$discount", 0] } });
    // const trendingProducts = trendingProduct.filter(item => item.discount > 0);



    if (trendingProducts.length === 0) {
      return res.json({
        data: [],
        meta: {
          current_page: page,
          total: 0,
          per_page: 10
        }
      });
    }

    // Extract product IDs
    const productIds = trendingProducts.map(item => item.productId); // Adjust field name as per your model

    // Fetch individual products using the specific product API
    const productPromises = productIds.map(id =>
      axios.get(`https://api.promodata.com.au/products/${id}`, { headers })
        .catch(error => {
          console.error(`Error fetching product ${id}:`, error.message);
          return null; // Return null for failed requests
        })
    );

    const productResponses = await Promise.all(productPromises);

    // Filter out failed requests and extract product data
    const fetchedProducts = productResponses
      .filter(response => response !== null)
      .map(response => response.data.data);

    // Fetch ignored products
    const ignResp = await axios.get(`https://api.promodata.com.au/products/ignored`, {
      headers,
    });

    // Fetch custom names
    const customNames = await getCustomNames();

    // Fetch supplier margins from your database
    const supplierMargins = await supplierMarginModel.find();
    const marginsMap = {};
    supplierMargins.forEach(item => {
      marginsMap[item.supplierId] = item.margin;
    });

    // Fetch category margins from your database
    const categoryMargins = await categoryMarginModal.find();
    const categoryMarginsMap = {};
    categoryMargins.forEach(item => {
      // Create a composite key: supplierId + categoryId
      const key = `${item.supplierId}_${item.categoryId}`;
      categoryMarginsMap[key] = item.margin;
    });

    // Check for global discount
    const globalDiscount = await GlobalDiscount.findOne({ isActive: true });
    const globalDiscountPercentage = globalDiscount ? globalDiscount.discount : 0;

    const ignoredIds = new Set(
      (ignResp.data.data || []).map(item => item.meta.id)
    );

    // Fetch category filters
    const filterCategories = await supCategory.find();

    // Add category-based filtering to ignored IDs
    if (doFilter && filterCategories.length > 0) {
      for (const category of filterCategories) {
        for (const product of fetchedProducts) {
          if (product.supplier?.supplier_id == category.supplierId &&
            product.product?.categorisation?.product_type?.type_group_id === category.categoryId) {
            ignoredIds.add(product.meta.id);
          }
        }
      }
    }

    // Process products and add margins to ALL price fields
    const processedProducts = await Promise.all(
      fetchedProducts.map(async (product) => {
        const supplierId = product.supplier?.supplier_id;
        const categoryId = product.product?.categorisation?.product_type?.type_group_id;

        // Get supplier margin
        const supplierMargin = marginsMap[supplierId] || 0;

        // Get category margin using composite key
        const categoryKey = `${supplierId}_${categoryId}`;
        const categoryMargin = categoryMarginsMap[categoryKey] || 0;

        // Total margin is supplier margin + category margin
        const totalMargin = supplierMargin + categoryMargin;

        // Apply total margin to all price-related fields
        let processedProduct = addMarginToAllPrices(product, totalMargin);

        // Then apply discount
        let discountPercentage = globalDiscountPercentage;

        // If no global discount, check for individual product discount
        if (!globalDiscountPercentage) {
          const productDiscountInfo = await getProductDiscount(product.meta.id);
          discountPercentage = productDiscountInfo.discount;
        }

        // Apply discount to all prices
        if (discountPercentage > 0) {
          processedProduct = applyDiscountToProduct(processedProduct, discountPercentage);
        }

        // Add margin and discount metadata to product
        processedProduct.marginInfo = {
          supplierMargin: supplierMargin,
          categoryMargin: categoryMargin,
          totalMargin: totalMargin
        };

        processedProduct.discountInfo = {
          discount: discountPercentage,
          isGlobal: globalDiscountPercentage > 0
        };

        return processedProduct;
      })
    );

    // Apply custom names to products
    const productsWithCustomNames = applyCustomNamesToProducts(processedProducts, customNames);

    // Get total count for pagination
    const totalTrendingCount = await trendingModel.countDocuments();

    if (doFilter) {
      const filteredProducts = productsWithCustomNames.filter(
        p => !ignoredIds.has(p.meta.id)
      );

      res.json({
        data: filteredProducts,
        meta: {
          current_page: page,
          total: totalTrendingCount,
          per_page: 10,
          last_page: Math.ceil(totalTrendingCount / 10)
        }
      });
    } else {
      res.json({
        data: productsWithCustomNames,
        ignoredProductIds: Array.from(ignoredIds),
        meta: {
          current_page: page,
          total: totalTrendingCount,
          per_page: 10,
          last_page: Math.ceil(totalTrendingCount / 10)
        }
      });
    }

  } catch (error) {
    console.error("Error in /api/client-products-trending:", error);
    res.status(500).json({ error: "Failed to fetch trending products" });
  }
});
app.get("/api/client-products-bestSellers", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const doFilter = req.query.filter !== 'false';
  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    // First, get trending product IDs from the database
    const trendingProducts = await BestSellerModel.find()



    if (trendingProducts.length === 0) {
      return res.json({
        data: [],
        meta: {
          current_page: page,
          total: 0,
          per_page: 10
        }
      });
    }

    // Extract product IDs
    const productIds = trendingProducts.map(item => item.productId); // Adjust field name as per your model

    // Fetch individual products using the specific product API
    const productPromises = productIds.map(id =>
      axios.get(`https://api.promodata.com.au/products/${id}`, { headers })
        .catch(error => {
          console.error(`Error fetching product ${id}:`, error.message);
          return null; // Return null for failed requests
        })
    );

    const productResponses = await Promise.all(productPromises);

    // Filter out failed requests and extract product data
    const fetchedProducts = productResponses
      .filter(response => response !== null)
      .map(response => response.data.data);

    // Fetch ignored products
    const ignResp = await axios.get(`https://api.promodata.com.au/products/ignored`, {
      headers,
    });

    // Fetch custom names
    const customNames = await getCustomNames();

    // Fetch supplier margins from your database
    const supplierMargins = await supplierMarginModel.find();
    const marginsMap = {};
    supplierMargins.forEach(item => {
      marginsMap[item.supplierId] = item.margin;
    });

    // Fetch category margins from your database
    const categoryMargins = await categoryMarginModal.find();
    const categoryMarginsMap = {};
    categoryMargins.forEach(item => {
      // Create a composite key: supplierId + categoryId
      const key = `${item.supplierId}_${item.categoryId}`;
      categoryMarginsMap[key] = item.margin;
    });

    // Check for global discount
    const globalDiscount = await GlobalDiscount.findOne({ isActive: true });
    const globalDiscountPercentage = globalDiscount ? globalDiscount.discount : 0;

    const ignoredIds = new Set(
      (ignResp.data.data || []).map(item => item.meta.id)
    );

    // Fetch category filters
    const filterCategories = await supCategory.find();

    // Add category-based filtering to ignored IDs
    if (doFilter && filterCategories.length > 0) {
      for (const category of filterCategories) {
        for (const product of fetchedProducts) {
          if (product.supplier?.supplier_id == category.supplierId &&
            product.product?.categorisation?.product_type?.type_group_id === category.categoryId) {
            ignoredIds.add(product.meta.id);
          }
        }
      }
    }

    // Process products and add margins to ALL price fields
    const processedProducts = await Promise.all(
      fetchedProducts.map(async (product) => {
        const supplierId = product.supplier?.supplier_id;
        const categoryId = product.product?.categorisation?.product_type?.type_group_id;

        // Get supplier margin
        const supplierMargin = marginsMap[supplierId] || 0;

        // Get category margin using composite key
        const categoryKey = `${supplierId}_${categoryId}`;
        const categoryMargin = categoryMarginsMap[categoryKey] || 0;

        // Total margin is supplier margin + category margin
        const totalMargin = supplierMargin + categoryMargin;

        // Apply total margin to all price-related fields
        let processedProduct = addMarginToAllPrices(product, totalMargin);

        // Then apply discount
        let discountPercentage = globalDiscountPercentage;

        // If no global discount, check for individual product discount
        if (!globalDiscountPercentage) {
          const productDiscountInfo = await getProductDiscount(product.meta.id);
          discountPercentage = productDiscountInfo.discount;
        }

        // Apply discount to all prices
        if (discountPercentage > 0) {
          processedProduct = applyDiscountToProduct(processedProduct, discountPercentage);
        }

        // Add margin and discount metadata to product
        processedProduct.marginInfo = {
          supplierMargin: supplierMargin,
          categoryMargin: categoryMargin,
          totalMargin: totalMargin
        };

        processedProduct.discountInfo = {
          discount: discountPercentage,
          isGlobal: globalDiscountPercentage > 0
        };

        return processedProduct;
      })
    );

    // Apply custom names to products
    const productsWithCustomNames = applyCustomNamesToProducts(processedProducts, customNames);

    // Get total count for pagination
    const totalTrendingCount = await trendingModel.countDocuments();

    if (doFilter) {
      const filteredProducts = productsWithCustomNames.filter(
        p => !ignoredIds.has(p.meta.id)
      );

      res.json({
        data: filteredProducts,
        meta: {
          current_page: page,
          total: totalTrendingCount,
          per_page: 10,
          last_page: Math.ceil(totalTrendingCount / 10)
        }
      });
    } else {
      res.json({
        data: productsWithCustomNames,
        ignoredProductIds: Array.from(ignoredIds),
        meta: {
          current_page: page,
          total: totalTrendingCount,
          per_page: 10,
          last_page: Math.ceil(totalTrendingCount / 10)
        }
      });
    }

  } catch (error) {
    console.error("Error in /api/client-products-trending:", error);
    res.status(500).json({ error: "Failed to fetch trending products" });
  }
});
// app.get('/myapi', async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
//   const headers = {
//     "x-auth-token": AUTH_TOKEN,
//     "Content-Type": "application/json",
//   };

//   try {
//     // Fetch products
//     const prodResp = await axios.get(`https://api.promodata.com.au/products?page=${page}`, {
//       headers,
//     });

//     // Fetch discounts, supplier margins, category margins, and existing margins
//     const discounts = await ProductDiscount.find();
//     const supplierMargins = await supplierMarginModel.find();
//     const categoryMargins = await categoryMarginModal.find(); // Add this line - you need to import this model
//     const existingMargins = await addMarginModel.find();

//     // Create supplier margins map for quick lookup
//     const supplierMarginsMap = {};
//     supplierMargins.forEach(item => {
//       supplierMarginsMap[item.supplierId] = item.margin;
//     });

//     // Create category margins map for quick lookup (supplierId-categoryId as key)
//     const categoryMarginsMap = {};
// categoryMargins.forEach(item => {
//   const key = `${item.supplierId}_${item.categoryId}`; // Use underscore for consistency
//   categoryMarginsMap[key] = item.margin;
// });

//     // Create existing margins map for quick lookup
//     const existingMarginsMap = {};
//     existingMargins.forEach(item => {
//       existingMarginsMap[item.productId] = item;
//     });

//     const response = prodResp.data.data;
//     const newResponse = [];
//     const discountedProductIds = discounts.map(discount => discount.productId);

//     // Helper function to get the appropriate margin for a product
//     const getMarginForProduct = (item) => {
//   const supplierId = item.supplier?.supplier_id;
//   // FIX: Use correct path to category ID
//   const categoryId = item.product?.categorisation?.product_type?.type_group_id;

//   // Get supplier margin
//   const supplierMargin = supplierMarginsMap[supplierId] || 0;

//   // Get category margin using correct key format (underscore, not hyphen)
//   const categoryKey = `${supplierId}_${categoryId}`;
//   const categoryMargin = categoryMarginsMap[categoryKey] || 0;

//   // FIX: Add both margins together (like in /api/client-products)
//   const totalMargin = supplierMargin + categoryMargin;

//   return totalMargin;
// };


//     // First loop: Process discounts
//     for (const item of response) {
//       if (discountedProductIds.includes(item.meta.id)) {
//         // Get appropriate margin for this product (category or supplier)
//         const margin = getMarginForProduct(item);

//         // Calculate margined price (base price + margin)
//         const basePrice = item.product.prices?.price_groups[0]?.base_price?.price_breaks[0]?.price || item.product.prices?.price_groups[0]?.additions?.price_breaks[0]?.price ||0;
//         const marginedPrice = basePrice + margin;

//         const backendUrl = req.protocol + '://' + req.get('host');
//         const resp = await fetch(`${backendUrl}/api/add-discount/add-discount`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             productId: item.meta.id,
//             discount: discounts.find(discount => discount.productId === item.meta.id).discount,
//             basePrice: marginedPrice // Using margined price instead of base price
//           })
//         });

//         const discountResponse = await resp.json();
//         newResponse.push(discountResponse.data.message);
//       } else {
//         const backendUrl = req.protocol + '://' + req.get('host');
//         const margin = getMarginForProduct(item);

//         // Calculate margined price (base price + margin)
//         const basePrice = item.product.prices?.price_groups[0]?.base_price?.price_breaks[0]?.price || item.product.prices?.price_groups[0]?.additions?.price_breaks[0]?.price ||0;
//         const marginedPrice = basePrice + margin;
//         const resp = await fetch(`${backendUrl}/api/add-discount/add-discount`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             productId: item.meta.id,
//             discount: 0,
//             basePrice: marginedPrice 
//           })
//         });

//         const discountResponse = await resp.json();
//         newResponse.push(discountResponse.data);
//       }
//     }

//     // Second loop: Process margins for all discounted products (using discounted prices)
//     for (const item of response) {
//       if (discountedProductIds.includes(item.meta.id)) {
//         // Get appropriate margin for this product (category or supplier)
//         const margin = getMarginForProduct(item);

//         // Calculate base price with margin
//         const basePrice = item.product.prices?.price_groups[0]?.base_price?.price_breaks[0].price || item.product.prices?.price_groups[0]?.additions?.price_breaks[0]?.price ||0;
//         const marginedPrice = (basePrice==0?0:basePrice) + margin;

//         // Check if this product has a discount applied (from the previous loop)
//         let priceForMargin = marginedPrice;

//         // If product has discount, we need to get the discounted price
//         if (discountedProductIds.includes(item.meta.id)) {
//           const discountInfo = discounts.find(discount => discount.productId === item.meta.id);
//           if (discountInfo) {
//             const discountAmount = (marginedPrice * discountInfo.discount) / 100;
//             priceForMargin = marginedPrice - discountAmount;
//           }
//         }

//         const existingMargin = existingMarginsMap[item.meta.id];
//         const marginValue = existingMargin ? existingMargin.margin : 0;

//         const backendUrl = req.protocol + '://' + req.get('host');
//         const resp = await fetch(`${backendUrl}/api/product-margin/add-margin`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             productId: item.meta.id,
//             margin: marginValue,
//             basePrice: priceForMargin // Using discounted price if available
//           })
//         });

//         const marginResponse = await resp.json();
//         newResponse.push(marginResponse.data.message);
//       }
//     }

//     res.json(newResponse);

//   } catch (error) {
//     console.error("Error in /myapi:", error);
//     res.status(500).json({ error: "Failed to process products" });
//   }
// });
// app.get('/myapi2', async (req, res) => {
//   const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
//   const headers = {
//     "x-auth-token": AUTH_TOKEN,
//     "Content-Type": "application/json",
//   };

//   try {
//     // Fetch products
//     const prodResp = await axios.get(`https://api.promodata.com.au/products`, {
//       headers,
//     });

//     // Fetch global discount, supplier margins, and existing margins
//     const globalDiscount = await GlobalDiscount.findOne({ isActive: true });
//     const supplierMargins = await supplierMarginModel.find();
//     const existingMargins = await addMarginModel.find();

//     // Create margins map for quick lookup
//     const marginsMap = {};
//     supplierMargins.forEach(item => {
//       marginsMap[item.supplierId] = item.margin;
//     });

//     // Create existing margins map for quick lookup
//     const existingMarginsMap = {};
//     existingMargins.forEach(item => {
//       existingMarginsMap[item.productId] = item;
//     });

//     const response = prodResp.data.data;
//     const newResponse = [];
//     const globalDiscountPercentage = globalDiscount ? globalDiscount.discount : 0;

//     // Process all products with global discount and margins
//     for (const item of response) {
//       try {
//         // Get supplier margin for this product
//         const supplierId = item.supplier?.supplier_id;
//         const supplierMargin = marginsMap[supplierId] || 0;

//         // Get base price from product
//         const basePrice = item?.product?.prices?.price_groups?.[0]?.base_price?.price_breaks?.[0]?.price;

//         if (!basePrice) {

//           continue;
//         }

//         // Step 1: Add supplier margin to base price
//         const marginedPrice = basePrice + supplierMargin;

//         // Step 2: Apply global discount if exists
//         let finalPrice = marginedPrice;
//         if (globalDiscountPercentage > 0) {
//           const discountAmount = (marginedPrice * globalDiscountPercentage) / 100;
//           finalPrice = marginedPrice - discountAmount;
//         }

//         // Step 3: Get existing product margin and add it to the globally discounted price
//         const existingMargin = existingMarginsMap[item.meta.id];
//         const marginValue = existingMargin ? existingMargin.margin : 0;

//         const backendUrl = req.protocol + '://' + req.get('host');
//         const resp = await fetch(`${backendUrl}/api/product-margin/add-margin`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             productId: item.meta.id,
//             margin: marginValue,
//             basePrice: finalPrice // Using globally discounted price as base
//           })
//         });

//         const marginResponse = await resp.json();
//         newResponse.push({
//           productId: item.meta.id,
//           originalPrice: basePrice,
//           supplierMargin: supplierMargin,
//           marginedPrice: marginedPrice,
//           globalDiscount: globalDiscountPercentage,
//           globallyDiscountedPrice: finalPrice,
//           existingMargin: marginValue,
//           response: marginResponse.data?.message || marginResponse.data
//         });

//       } catch (error) {
//         console.error(`Error processing product ${item.meta.id}:`, error);
//         newResponse.push({
//           productId: item.meta.id,
//           error: error.message
//         });
//       }
//     }

//     res.json({
//       globalDiscountApplied: globalDiscountPercentage,
//       totalProductsProcessed: newResponse.length,
//       results: newResponse
//     });

//   } catch (error) {
//     console.error("Error in /myapi2:", error);
//     res.status(500).json({ error: "Failed to process products with global discount" });
//   }
// });
// Updated single product endpoint with discount calculation
app.get("/api/single-product/:id", async (req, res) => {
  const { id } = req.params;
  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    // Fetch product details first
    const response = await axios.get(
      `https://api.promodata.com.au/products/${id}`,
      { headers }
    );

    const product = response.data.data;
    const supplierId = product.supplier.supplier_id;
    const categoryId = product.product?.categorisation?.product_type?.type_group_id;

    // Execute all database queries and function calls in parallel
    const [
      supplierMargin,
      categoryMargin,
      discountInfo,
      customNames
    ] = await Promise.all([
      supplierMarginModel.findOne({ supplierId: supplierId }),
      categoryMarginModal.findOne({
        supplierId: supplierId,
        categoryId: categoryId
      }),
      getProductDiscount(id),
      getCustomNames()
    ]);

    // Process margins
    const supplierMarginAmount = supplierMargin?.margin || 0;
    const categoryMarginAmount = categoryMargin?.margin || 0;
    const totalMargin = supplierMarginAmount + categoryMarginAmount;

    // Apply total margin first
    let processedProduct = addMarginToAllPrices(product, totalMargin);

    // Apply discount to all prices if discount exists
    if (discountInfo.discount > 0) {
      processedProduct = applyDiscountToProduct(processedProduct, discountInfo.discount);
    }

    // Add margin and discount metadata to product
    processedProduct.marginInfo = {
      supplierMargin: supplierMarginAmount,
      categoryMargin: categoryMarginAmount,
      totalMargin: totalMargin
    };

    processedProduct.discountInfo = discountInfo;

    // Apply custom name if exists
    const productWithCustomName = applyCustomNamesToProducts([processedProduct], customNames)[0];

    res.json({
      ...response.data,
      data: productWithCustomName
    });
  } catch (error) {
    console.error("Error in /api/single-product/:id", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Updated params-products endpoint with category margin calculation
app.get("/api/params-products", async (req, res) => {
  const category = req.query.product_type_ids;
  const itemCount = parseInt(req.query.items_per_page) || 10;
  const page = parseInt(req.query.page) || 1;
  const doFilter = req.query.filter !== "false";
  const supplier = req.query.supplier_id || null;

  if (!category) {
    return res.status(400).json({ error: "Category ID is required" });
  }

  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    // Calculate pagination indices upfront
    const startIndex = (page - 1) * itemCount;
    const endIndex = startIndex + itemCount;

    // Parallel fetch all required data immediately
    const [
      categoryFound,
      supplierMargins,
      categoryMargins,
      globalDiscount,
      filterCategories,
      customNames,
      ignResp,
      firstResp
    ] = await Promise.all([
      Prioritize.findOne({ categoryId: category }),
      supplierMarginModel.find(),
      categoryMarginModal.find(),
      GlobalDiscount.findOne({ isActive: true }),
      doFilter ? supCategory.find() : Promise.resolve([]),
      getCustomNames(),
      axios.get(`https://api.promodata.com.au/products/ignored`, { headers }),
      axios.get(`https://api.promodata.com.au/products?product_type_ids=${category}${supplier ? `&supplier_id=${supplier}` : ""}&items_per_page=${itemCount}&page=1&include_discontinued=false`, { headers })
    ]);

    // Pre-process all lookup maps
    const prioritizedIds = categoryFound?.productIds?.map(String) || [];
    const prioritizedIdsSet = new Set(prioritizedIds);

    const marginsMap = Object.fromEntries(
      supplierMargins.map(item => [String(item.supplierId), item.margin])
    );

    const categoryMarginsMap = Object.fromEntries(
      categoryMargins.map(item => [`${item.supplierId}_${item.categoryId}`, item.margin])
    );

    const globalDiscountPercentage = globalDiscount?.discount || 0;
    const promodataMeta = firstResp.data;
    const promodataTotalPages = promodataMeta.total_pages || 1;

    // Build ignored set (excluding prioritized IDs)
    const ignoredIdsFromApi = (ignResp.data.data || []).map(i => String(i.meta?.id)).filter(Boolean);
    const ignoredIds = new Set(ignoredIdsFromApi.filter(id => !prioritizedIdsSet.has(id)));

    // Handle supplier-specific prioritized products
    let prioritizedIdsForThisSupplier = prioritizedIds;
    let prioritizedProductCache = {};

    if (supplier) {
      // Batch fetch prioritized products with concurrency limit
      const batchSize = 10;
      const prioritizedBatches = [];
      for (let i = 0; i < prioritizedIds.length; i += batchSize) {
        prioritizedBatches.push(prioritizedIds.slice(i, i + batchSize));
      }

      const allPrioritizedResults = [];
      for (const batch of prioritizedBatches) {
        const batchResults = await Promise.allSettled(
          batch.map(id =>
            axios.get(`https://api.promodata.com.au/products/${id}`, { headers })
              .then(r => ({ id: String(id), product: r.data.data }))
          )
        );
        allPrioritizedResults.push(...batchResults);
      }

      // Filter by supplier and build cache
      prioritizedIdsForThisSupplier = [];
      for (const result of allPrioritizedResults) {
        if (result.status === 'fulfilled' && result.value) {
          const { id, product } = result.value;
          prioritizedProductCache[id] = product;
          if (String(product?.supplier?.supplier_id) === String(supplier)) {
            prioritizedIdsForThisSupplier.push(id);
          }
        }
      }
    }

    const totalPrioritized = prioritizedIdsForThisSupplier.length;

    // Get prioritized products for this page
    const prioritizedSliceIds = prioritizedIdsForThisSupplier.slice(startIndex, endIndex);
    let prioritizedProductsClean = [];

    if (prioritizedSliceIds.length > 0) {
      if (supplier && Object.keys(prioritizedProductCache).length > 0) {
        // Use cached results
        prioritizedProductsClean = prioritizedSliceIds
          .map(id => prioritizedProductCache[id])
          .filter(Boolean);
      } else {
        // Batch fetch with concurrency control
        const batchSize = 5;
        const batches = [];
        for (let i = 0; i < prioritizedSliceIds.length; i += batchSize) {
          batches.push(prioritizedSliceIds.slice(i, i + batchSize));
        }

        const allResults = [];
        for (const batch of batches) {
          const batchResults = await Promise.allSettled(
            batch.map(id =>
              axios.get(`https://api.promodata.com.au/products/${id}`, { headers })
                .then(resp => resp.data.data)
            )
          );
          allResults.push(...batchResults);
        }

        prioritizedProductsClean = allResults
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => result.value);
      }
    }

    // Calculate general products needed
    const generalStart = Math.max(0, startIndex - totalPrioritized);
    const generalEnd = Math.max(0, endIndex - totalPrioritized);
    let generalSlice = [];

    if (generalEnd > generalStart) {
      // Pre-build filter lookup for category filtering
      const filterLookup = new Set();
      if (doFilter && filterCategories.length > 0) {
        filterCategories.forEach(cf => {
          filterLookup.add(`${cf.supplierId}_${cf.categoryId}`);
        });
      }

      // Smart pagination: calculate which pages we actually need
      const neededItems = generalEnd - generalStart;
      const estimatedStartPage = Math.max(1, Math.floor(generalStart / itemCount) + 1);
      const maxPagesToFetch = Math.min(5, Math.ceil(neededItems / itemCount) + 2);

      // Parallel fetch multiple pages with limit
      const pagePromises = [];
      for (let p = estimatedStartPage; p <= Math.min(estimatedStartPage + maxPagesToFetch - 1, promodataTotalPages); p++) {
        const pageUrl = `https://api.promodata.com.au/products?product_type_ids=${category}${supplier ? `&supplier_id=${supplier}` : ""}&items_per_page=${itemCount}&page=${p}&include_discontinued=false`;
        pagePromises.push(
          axios.get(pageUrl, { headers })
            .then(resp => resp.data.data || [])
            .catch(err => {
              console.warn(`Failed to fetch page ${p}:`, err?.message || err);
              return [];
            })
        );
      }

      const allPageResults = await Promise.all(pagePromises);
      const allProducts = allPageResults.flat();

      // Single-pass filtering (collect filtered non-prioritized items from fetched pages)
      const filteredNonPrioritized = [];
      for (const prod of allProducts) {
        const pid = String(prod.meta?.id);

        // Skip prioritized and ignored
        if (prioritizedIdsSet.has(pid) || ignoredIds.has(pid)) continue;

        // Apply category filter if enabled
        if (doFilter && filterLookup.size > 0) {
          const supplierId2 = prod?.supplier?.supplier_id;
          const productTypeGroupId = prod?.product?.categorisation?.product_type?.type_group_id;
          const filterKey = `${supplierId2}_${productTypeGroupId}`;

          if (filterLookup.has(filterKey) && !prioritizedIdsSet.has(pid)) {
            ignoredIds.add(pid);
            continue;
          }
        }

        filteredNonPrioritized.push(prod);
        // don't break here — we need the whole window from the fetched pages
      }

      // Convert global indices (generalStart..generalEnd) to indices relative to the first fetched page
      const firstFetchedPageOffset = (estimatedStartPage - 1) * itemCount; // global index of first item in allProducts
      const relativeStart = Math.max(0, generalStart - firstFetchedPageOffset);
      const relativeEnd = Math.max(0, generalEnd - firstFetchedPageOffset);

      // Slice using relative indices
      generalSlice = filteredNonPrioritized.slice(relativeStart, relativeEnd);

    }

    // Combine results
    const finalPageProductsRaw = [...prioritizedProductsClean, ...generalSlice];

    // Batch process all products with pre-built lookups
    const processedProducts = await Promise.all(
      finalPageProductsRaw.map(async (product) => {
        const supplierId2 = String(product.supplier.supplier_id);
        const categoryId2 = product.product?.categorisation?.product_type?.type_group_id;

        // Fast lookup margins
        const supplierMargin = marginsMap[supplierId2] || 0;
        const categoryMargin = categoryMarginsMap[`${supplierId2}_${categoryId2}`] || 0;
        const totalMargin = supplierMargin + categoryMargin;

        let processedProduct = addMarginToAllPrices(product, totalMargin);

        // Determine discount efficiently
        let discountPercentage = globalDiscountPercentage;
        if (!globalDiscountPercentage) {
          const productDiscountInfo = await getProductDiscount(product.meta.id);
          discountPercentage = productDiscountInfo.discount || 0;
        }

        if (discountPercentage > 0) {
          processedProduct = applyDiscountToProduct(processedProduct, discountPercentage);
        }

        // Add metadata
        processedProduct.marginInfo = {
          supplierMargin,
          categoryMargin,
          totalMargin
        };

        processedProduct.discountInfo = {
          discount: discountPercentage,
          isGlobal: globalDiscountPercentage > 0
        };

        return processedProduct;
      })
    );

    // Apply custom names
    const productsWithCustomNames = applyCustomNamesToProducts(processedProducts, customNames);

    // Return response
    const response = {
      ...promodataMeta,
      data: productsWithCustomNames
    };

    if (!doFilter) {
      response.ignoredProductIds = Array.from(ignoredIds);
    }

    return res.json(response);

  } catch (error) {
    console.error("Error fetching category products:", error);
    return res.status(500).json({ error: "Failed to fetch products", details: error.message });
  }
});
// *********************************************************************
// Ignore and Unignore API *********************************************************************
app.get("/api/ignored-products", async (req, res) => {

  try {
    const response = await axios.get(
      "https://api.promodata.com.au/products/ignored",
      {
        headers: {
          "x-auth-token":
            "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to ignore product" });
  }
});
app.post("/api/ignore-product", async (req, res) => {
  const { productId } = req.body;

  try {
    const response = await axios.post(
      "https://api.promodata.com.au/products/ignore",
      { product_ids: [productId] },
      {
        headers: {
          "x-auth-token":
            "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
        },
      }
    );
    res.json(response.data.description);
  } catch (error) {
    res.status(500).json({ error: "Failed to ignore product" });
  }
});

app.post("/api/unignore-product", async (req, res) => {
  const { productId } = req.body;
  try {
    const response = await axios.post(
      "https://api.promodata.com.au/products/unignore",
      { product_ids: [productId] },
      {
        headers: {
          "x-auth-token":
            "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
        },
      }
    );
    res.json(response.data.description);
  } catch (error) {
    console.error("Error unignoring product:", error);
    res.status(500).json({ error: "Failed to unignore product" });
  }
});

// Category API *********************************************************************



// *********************************************************************




app.get("/api/category-products", async (req, res) => {
  try {
    const response = await axios.get("https://api.promodata.com.au/product-types/v2", {
      headers: {
        "x-auth-token":
          "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});




// ***************************************************************
app.get("/api/v1-categories", async (req, res) => {
  try {
    const response = await axios.get("https://api.promodata.com.au/product-types/v1", {
      headers: {
        "x-auth-token":
          "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});



// *****************************************************************


app.post('/create-checkout-session', async (req, res) => {
  const { products, gst, coupon, shipping } = req.body // Get GST and coupon from frontend

  // Calculate the total before GST
  const subtotal = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

  // Add product line items
  const lineItems = products.map((product) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: product.name,
        images: [product.image],
      },
      unit_amount: Math.round(product.price * 100),
    },
    quantity: product.quantity,
  }));
  if (shipping && shipping > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Shipping',
          description: 'Shipping charges',
        },
        unit_amount: Math.round(shipping * 100), // Convert to cents
      },
      quantity: 1,
    });
  }

  // Add GST as a separate line item if it exists
  if (gst && gst > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'GST (10%)',
          description: 'Goods and Services Tax',
        },
        unit_amount: Math.round(gst * 100), // Convert GST amount to cents
      },
      quantity: 1,
    });
  }

  // Calculate total after GST
  const totalWithGst = subtotal + (gst || 0);

  // Create discount object if coupon is applied
  let discounts = [];
  if (coupon && coupon.discountAmount && coupon.discountAmount > 0) {
    // Create a coupon in Stripe (you can also create this beforehand and store the ID)
    const stripeCoupon = await stripe.coupons.create({
      name: `Discount - ${coupon.code}`,
      amount_off: Math.round(coupon.discountAmount * 100), // Convert to cents
      currency: 'usd',
      duration: 'once',
    });

    discounts = [{
      coupon: stripeCoupon.id
    }];
  }

  const origin = process.env.FRONTEND_URL || 'http://localhost:5173';

  const sessionConfig = {
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cancel`,
  };

  // Add discounts if coupon is applied
  if (discounts.length > 0) {
    sessionConfig.discounts = discounts;
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  res.json({ id: session.id });
});


// console.log(`MONGO_URI: ${process.env.MONGO_URI}`);
console.log(`PORT: ${process.env.PORT}`);

const PORT = process.env.PORT || 5000
app.get("/", (req, res) => res.send("API WORKING"));

export default app;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// akash 