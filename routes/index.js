import express from "express";
// import router from express.Router();
import UserRoutes from "./userRoutes.js"
import checkoutRoutes from "./checkoutRoutes.js";
import discontRoutes from "./discountRoute.js";
import blogRouter from "./blogRoutes.js";
import favouriteRouter from "./favouriteRoute.js";
import trendingRouter from "./trendingRoutes.js";
import newArrival from "./newArrival.js";
import australiaRouter from "./australiaRoutes.js";
import bestSeller from "./bestSellerRoutes.js";
import hourProduction24Router from "./hourProductionRoutes.js";
// <<<<<<< HEAD
// =======
import marginRoutes from './marginRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';
import categoryRouter from './supplierCategoryRoutes.js';
import coupenRouter from './coupenRouter.js';
import shippingRouter from './shippingRouter.js';
import contactRouter from './contactRouter.js';
import Prioritize from "../models/Prioritize.js";
// >>>>>>> 9676ff4 (Initial commit)
const router = express.Router();

router.use("/auth", UserRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/add-discount", discontRoutes);
router.use("/blogs", blogRouter);
router.use("/favourites", favouriteRouter);
router.use('/categories',categoryRouter)
router.use('/trending',trendingRouter)
router.use('/newArrival',newArrival)
router.use('/bestSeller',bestSeller)
router.use('/subscription',subscriptionRoutes)
router.use('/coupen',coupenRouter)
router.use('/shipping',shippingRouter)
router.use('/contact',contactRouter)
router.use('/24hour',hourProduction24Router)
router.use('/australia', australiaRouter);
// <<<<<<< HEAD
// =======
router.use('/product-margin', marginRoutes);

// Assumes express router and Prioritize model already defined above
// Modified /prioritize/add to compare IDs as strings and added GET /prioritize/:categoryId

// 1. ADD TO PRIORITIZE
router.post('/prioritize/add', async (req, res) => {
  try {
    const { categoryId, categoryName, productId } = req.body;

    if (!categoryId || !categoryName || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Category ID, Category Name, and Product ID are required'
      });
    }

    // Check if category already exists in prioritize
    let prioritizeEntry = await Prioritize.findOne({ categoryId });

    if (prioritizeEntry) {
      // Category exists, check if product is already prioritized (compare as strings)
      const already = (prioritizeEntry.productIds || []).some(
        id => String(id) === String(productId)
      );

      if (!already) {
        prioritizeEntry.productIds.push(productId);
        await prioritizeEntry.save();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Product is already prioritized'
        });
      }
    } else {
      // Create new entry for this category
      prioritizeEntry = new Prioritize({
        categoryId,
        categoryName,
        productIds: [productId]
      });
      await prioritizeEntry.save();
    }

    res.status(200).json({
      success: true,
      message: 'Product prioritized successfully',
      data: prioritizeEntry
    });

  } catch (error) {
    console.error('Error adding to prioritize:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 2. REMOVE FROM PRIORITIZE
router.post('/prioritize/remove', async (req, res) => {
  try {
    const { categoryId, productId } = req.body;

    if (!categoryId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Category ID and Product ID are required'
      });
    }

    const prioritizeEntry = await Prioritize.findOne({ categoryId });

    if (!prioritizeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Category not found in prioritize list'
      });
    }

    // Remove product ID from array (string-safe)
    prioritizeEntry.productIds = (prioritizeEntry.productIds || []).filter(
      id => String(id) !== String(productId)
    );

    // If no products left, remove the entire category entry
    if (prioritizeEntry.productIds.length === 0) {
      await Prioritize.deleteOne({ categoryId });
      return res.status(200).json({
        success: true,
        message: 'Product unprioritized and category removed (no products left)'
      });
    } else {
      await prioritizeEntry.save();
      return res.status(200).json({
        success: true,
        message: 'Product unprioritized successfully',
        data: prioritizeEntry
      });
    }

  } catch (error) {
    console.error('Error removing from prioritize:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 3. GET PRIORITIZE FOR A CATEGORY (new & efficient)
router.get('/prioritize/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'categoryId required' });
    }

    const prioritizeEntry = await Prioritize.findOne({ categoryId });

    if (!prioritizeEntry) {
      return res.status(200).json({
        success: true,
        message: 'No prioritized entry for this category',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Prioritized data fetched for category',
      data: prioritizeEntry
    });
  } catch (error) {
    console.error('Error fetching prioritized data for category:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
router.post('/prioritize/reorder', async (req, res) => {
  try {
    const { categoryId, productId, newPosition } = req.body;

    if (!categoryId || !productId || newPosition === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Category ID, Product ID, and new position are required'
      });
    }

    const prioritizeEntry = await Prioritize.findOne({ categoryId });

    if (!prioritizeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Category not found in prioritize list'
      });
    }

    // Convert productId to string for comparison (since we store as String in schema)
    const productIdStr = String(productId);
    const currentIndex = prioritizeEntry.productIds.findIndex(id => id === productIdStr);

    if (currentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in prioritized list'
      });
    }

    // Remove from current position
    const [movedProduct] = prioritizeEntry.productIds.splice(currentIndex, 1);
    
    // Insert at new position (0-based index)
    const targetIndex = Math.max(0, Math.min(newPosition - 1, prioritizeEntry.productIds.length));
    prioritizeEntry.productIds.splice(targetIndex, 0, movedProduct);

    await prioritizeEntry.save();

    res.status(200).json({
      success: true,
      message: 'Product order updated successfully',
      data: prioritizeEntry
    });

  } catch (error) {
    console.error('Error reordering product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 4. (Optional) GET ALL PRIORITIZED API kept if you still need it
router.get('/prioritized', async (req, res) => {
  try {
    const prioritizedData = await Prioritize.find({});

    res.status(200).json({
      success: true,
      message: 'Prioritized data fetched successfully',
      data: prioritizedData
    });

  } catch (error) {
    console.error('Error fetching prioritized data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


export default router;
