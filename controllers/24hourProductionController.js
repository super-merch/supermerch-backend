import hourProduction24 from "../models/hourProduction.js";
import categoryMarginModal from "../models/categoryMargin.js";
import GlobalDiscount from "../models/GlobalDiscount.js";
import supplierMarginModel from "../models/SupplierMargin.js";
import { addMarginToAllPrices, applyCustomNamesToProducts, applyDiscountToProduct, getCustomNames, getProductDiscount } from "../server.js";

export const addTo24HourProduction = async (req, res) => {
    try {
        const { id } = req.body;
        const found = await hourProduction24.findOne({ id });
        if (found) {
            return res.status(200).json("Already added");
        }
        const new24Hour = new hourProduction24({
            id,
        });
        await new24Hour.save();
        res.status(200).json(new24Hour);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeFrom24HourProduction = async (req, res) => {
    try {
        const { id } = req.params;
        await hourProduction24.deleteOne({ id });
        res.status(200).json("Removed from 24 Hour Production");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAll24HourProduction = async (req, res) => {
    try {
        const production24Hour = await hourProduction24.find();
        res.status(200).json(production24Hour);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const get24HourProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const sortOption = req.query.sort || '';
    const fetchAll = req.query.all === 'true';

    // Get all 24 Hour product IDs from database
    const hourDocs = await hourProduction24.find().select('id productId _id');
    
    if (!hourDocs || hourDocs.length === 0) {
      return res.status(200).json({
        data: [],
        totalPages: 0,
        totalCount: 0,
        currentPage: page
      });
    }

    // Extract unique product IDs
    const productIds = hourDocs.map(doc => 
      doc.id || doc.productId || doc._id?.toString()
    ).filter(Boolean);

    const AUTH_TOKEN = process.env.PROMO_AUTH_TOKEN || 'NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ';
    const headers = {
      'x-auth-token': AUTH_TOKEN,
      'Content-Type': 'application/json',
    };

    // Enhanced fetch function with retry logic
    const fetchProductWithRetry = async (productId, retries = 3, delay = 1000) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const url = `https://api.promodata.com.au/products/${productId}`;
          const response = await fetch(url, { 
            method: 'GET', 
            headers,
            timeout: 10000
          });
          
          if (!response.ok) {
            if (response.status === 404) {
              return { id: productId, error: true, message: 'Product not found' };
            }
            throw new Error(`HTTP ${response.status}`);
          }
          
          const json = await response.json();
          
          let productData = null;
          if (json?.data?.data) productData = json.data.data;
          else if (json?.data) productData = json.data;
          else productData = json;
          
          if (productData && productData.product) {
            return { id: productId, product: productData, success: true };
          }
          
          throw new Error('Invalid product data structure');
          
        } catch (error) {
          if (attempt === retries) {
            return { 
              id: productId, 
              error: true, 
              message: `Failed after ${retries} attempts: ${error.message}` 
            };
          }
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    };

    // Fetch products with concurrency control
    const BATCH_SIZE = 5;
    const results = [];
    
    for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
      const batch = productIds.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(productId => fetchProductWithRetry(productId));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      if (i + BATCH_SIZE < productIds.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Filter successful products
    const validProducts = results.filter(item => item.success && item.product);
    

    // Apply sorting if specified
    let sortedProducts = [...validProducts];
    if (sortOption) {
      sortedProducts.sort((a, b) => {
        const getPriceForSort = (item) => {
          const priceGroups = item.product.product?.prices?.price_groups || [];
          const basePrice = priceGroups.find(group => group?.base_price) || {};
          const priceBreaks = basePrice.base_price?.price_breaks || [];
          return priceBreaks[0]?.price || 0;
        };

        const priceA = getPriceForSort(a);
        const priceB = getPriceForSort(b);

        if (sortOption === 'lowToHigh') return priceA - priceB;
        if (sortOption === 'highToLow') return priceB - priceA;
        return 0;
      });
    }

    // If fetchAll is true, return all products
    if (fetchAll) {
      return res.status(200).json(sortedProducts);
    }

    // Apply pagination
    const totalCount = sortedProducts.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalCount);
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

    // Early return if no products to process
    if (paginatedProducts.length === 0) {
      return res.status(200).json({
        data: [],
        totalPages,
        totalCount,
        currentPage: page,
        itemsPerPage: limit
      });
    }

    // Pre-fetch all margin and discount data in parallel
    const [supplierMargins, categoryMargins, globalDiscount] = await Promise.all([
      supplierMarginModel.find(),
      categoryMarginModal.find(),
      GlobalDiscount.findOne({ isActive: true })
    ]);

    const marginsMap = {};
    supplierMargins.forEach(item => {
      marginsMap[String(item.supplierId)] = item.margin;
    });

    const categoryMarginsMap = {};
    categoryMargins.forEach(item => {
      const key = `${item.supplierId}_${item.categoryId}`;
      categoryMarginsMap[key] = item.margin;
    });

    const globalDiscountPercentage = globalDiscount ? globalDiscount.discount : 0;

    // Process products with margins and discounts
    const processedProducts = await Promise.all(
      paginatedProducts.map(async (item) => {
        try {
          const product = item.product;
          const supplierId = String(product.supplier.supplier_id);
          const categoryId = product.product?.categorisation?.product_type?.type_group_id;

          const supplierMargin = marginsMap[supplierId] || 0;
          const categoryKey = `${supplierId}_${categoryId}`;
          const categoryMargin = categoryMarginsMap[categoryKey] || 0;
          const totalMargin = supplierMargin + categoryMargin;

          let processedProduct = await addMarginToAllPrices(product, totalMargin);

          let discountPercentage = globalDiscountPercentage;
          if (!globalDiscountPercentage) {
            const productDiscountInfo = await getProductDiscount(product.meta.id);
            discountPercentage = productDiscountInfo.discount || 0;
          }

          if (discountPercentage > 0) {
            processedProduct = applyDiscountToProduct(processedProduct, discountPercentage);
          }

          processedProduct.marginInfo = {
            supplierMargin,
            categoryMargin,
            totalMargin
          };

          processedProduct.discountInfo = {
            discount: discountPercentage,
            isGlobal: globalDiscountPercentage > 0
          };

          return { ...item, product: processedProduct };
        } catch (error) {
          console.error(`Error processing product ${item.id}:`, error);
          return { ...item, error: true, processingError: error.message };
        }
      })
    );

    // Filter out products that failed processing
    const successfullyProcessedProducts = processedProducts.filter(item => !item.error);

    // Apply custom names
    const customNames = await getCustomNames();
    const productsWithCustomNames = applyCustomNamesToProducts(
      successfullyProcessedProducts.map(item => item.product), 
      customNames
    );

    return res.status(200).json({
      data: productsWithCustomNames,
      totalPages: totalPages,
      totalCount: totalCount,
      currentPage: page,
      itemsPerPage: limit
    });

  } catch (error) {
    console.error('get24HourProducts error:', error);
    return res.status(500).json({ 
      message: error.message || 'Internal server error',
      data: [],
      totalPages: 0,
      totalCount: 0
    });
  }
};