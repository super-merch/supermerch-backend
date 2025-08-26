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
    const fetchAll = req.query.all === 'true'; // For price filtering

    // Get all Australia product IDs from database
    const docs = await hourProduction24.find();

    if (!docs || docs.length === 0) {
      return res.status(200).json({
        data: [],
        totalPages: 0,
        totalCount: 0,
        currentPage: page
      });
    }

    const AUTH_TOKEN = process.env.PROMO_AUTH_TOKEN || 'NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ';
    const headers = {
      'x-auth-token': AUTH_TOKEN,
      'Content-Type': 'application/json',
    };

    // Fetch all products from PromoData API
    const fetchPromises = docs.map((doc) => {
      const pid = doc.id || doc._id || doc.productId || '';
      const url = `https://api.promodata.com.au/products/${pid}`;
      return fetch(url, { method: 'GET', headers })
        .then(async (resp) => {
          if (!resp.ok) {
            throw new Error(`Promodata fetch failed for ${pid} (status ${resp.status})`);
          }
          const json = await resp.json();
          
          if (json?.data?.data) return { id: pid, product: json.data.data };
          if (json?.data) return { id: pid, product: json.data };
          return { id: pid, product: json };
        })
        .catch((err) => {
          return { id: pid, error: true, message: err.message };
        });
    });

    const results = await Promise.all(fetchPromises);

    // Filter out failed requests and invalid products
    const validProducts = results.filter(item => {
      if (!item.product || item.error) return false;
      
      // Check if product has valid pricing
      const priceGroups = item.product.product?.prices?.price_groups || [];
      const basePrice = priceGroups.find(group => group?.base_price) || {};
      const priceBreaks = basePrice.base_price?.price_breaks || [];
      
      return priceBreaks.length > 0 && 
             priceBreaks[0]?.price !== undefined && 
             priceBreaks[0]?.price > 0;
    });

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

    // If fetchAll is true, return all products (for price filtering)
    if (fetchAll) {
      return res.status(200).json(sortedProducts);
    }

    // Apply pagination
    const totalCount = sortedProducts.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

    // Apply margins and discounts
    const supplierMargins = await supplierMarginModel.find();
    const marginsMap = {};
    supplierMargins.forEach(item => {
      marginsMap[String(item.supplierId)] = item.margin;
    });

    const categoryMargins = await categoryMarginModal.find();
    const categoryMarginsMap = {};
    categoryMargins.forEach(item => {
      const key = `${item.supplierId}_${item.categoryId}`;
      categoryMarginsMap[key] = item.margin;
    });

    const globalDiscount = await GlobalDiscount.findOne({ isActive: true });
    const globalDiscountPercentage = globalDiscount ? globalDiscount.discount : 0;

    // Process products with margins and discounts
    const processedProducts = await Promise.all(
      paginatedProducts.map(async (item) => {
        const product = item.product;
        const supplierId = String(product.supplier.supplier_id);
        const categoryId = product.product?.categorisation?.product_type?.type_group_id;

        const supplierMargin = marginsMap[supplierId] || 0;
        const categoryKey = `${supplierId}_${categoryId}`;
        const categoryMargin = categoryMarginsMap[categoryKey] || 0;
        const totalMargin = supplierMargin + categoryMargin;

        let processedProduct = addMarginToAllPrices(product, totalMargin);

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
      })
    );

    // Apply custom names
    const customNames = await getCustomNames();
    const productsWithCustomNames = applyCustomNamesToProducts(
      processedProducts.map(item => item.product), 
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
    console.error('getAustraliaProducts error:', error);
    return res.status(500).json({ 
      message: error.message || 'Internal server error',
      data: [],
      totalPages: 0,
      totalCount: 0
    });
  }
};