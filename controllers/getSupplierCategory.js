import axios from "axios";
import supCategory from "../models/category.js";

export const getSupplierCategory = async (req, res) => {
    const supplierId = req.query.supplierId;
    const headers = {
        "x-auth-token": "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
    };

    try {
        // 1) Fetch product types hierarchy first (parallel to product fetching)
        const typesPromise = axios.get("https://api.promodata.com.au/product-types", { headers });
        
        // 2) Fetch products with parallel requests and process on-the-fly
        const typeIds = new Set();
        const typeGroupIds = new Set();
        let page = 1;
        let totalProducts = 0;
        
        // Function to process products and extract type IDs
        const processProducts = (products) => {
            products.forEach((p, index) => {
                try {
                    const categorisation = p.product?.categorisation;
                    if (!categorisation) return;

                    // Check promodata_product_type
                    const promotype = categorisation.promodata_product_type;
                    if (promotype && promotype.type_id) {
                        typeIds.add(promotype.type_id);
                        if (promotype.type_group_id) {
                            typeGroupIds.add(promotype.type_group_id);
                        }
                    }

                    // Also check regular product_type as fallback
                    const productType = categorisation.product_type;
                    if (productType && productType.type_id) {
                        typeIds.add(productType.type_id);
                        if (productType.type_group_id) {
                            typeGroupIds.add(productType.type_group_id);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing product ${totalProducts + index}:`, error);
                }
            });
        };

        // Fetch all pages with parallel requests (batches of 3)
        const fetchBatch = async (startPage, batchSize = 3) => {
            const promises = [];
            for (let i = 0; i < batchSize; i++) {
                const currentPage = startPage + i;
                promises.push(
                    axios.get(
                        `https://api.promodata.com.au/products?supplier_id=${supplierId}&items_per_page=200&page=${currentPage}`,
                        { headers }
                    ).catch(err => ({ error: err, page: currentPage }))
                );
            }
            return Promise.all(promises);
        };

        // Process products in batches
        while (true) {
            console.log(`Fetching pages ${page} to ${page + 2}...`);
            const responses = await fetchBatch(page, 3);
            
            let hasMoreData = false;
            let processedInBatch = 0;
            
            for (const response of responses) {
                if (response.error) {
                    console.error(`Error fetching page ${response.page}:`, response.error.message);
                    continue;
                }
                
                const products = response.data?.data;
                if (!Array.isArray(products) || products.length === 0) {
                    continue;
                }
                
                processProducts(products);
                totalProducts += products.length;
                processedInBatch++;
                
                if (products.length === 200) {
                    hasMoreData = true;
                }
            }
            
            if (!hasMoreData || processedInBatch === 0) break;
            page += 3;
        }

        console.log(`Total products fetched: ${totalProducts}`);

        // 3) Wait for product types and filter categories
        const typesResp = await typesPromise;
        const allGroups = typesResp.data.data;

        // 4) Filter to only the groups we actually saw (optimized)
        const categories = [];
        for (const group of allGroups) {
            // Check if any subtype in this group matches our collected type IDs
            const hasMatch = group.subTypes.some(sub => typeIds.has(sub.id));
            if (hasMatch) {
                categories.push({
                    groupId: group.id,        // ✅ Ensure this is included
                    groupName: group.name,    // ✅ Ensure this is included
                });
            }
        }

        console.log(`Final categories count: ${categories.length}`);

        if (categories.length === 0) {
            console.log("No categories found. Debug info:");
            console.log("- Total products:", totalProducts);
            console.log("- Type IDs collected:", Array.from(typeIds));
            console.log("- Available groups:", allGroups.map(g => g.id));
        }

        return res.json({ data: categories });

    } catch (err) {
        console.error("getSupplierCategory error:", err.message);
        console.error("Error details:", err.response?.data || err);
        return res.status(500).json({ 
            error: "Failed to fetch supplier categories",
            details: err.message 
        });
    }
};

export const activateSupplierCategory = async (req, res) => {
    const {supplierId, supplierName, categoryId, categoryName} = req.body;
    try {
        const found = await supCategory.findOne({
            supplierId: supplierId,
            categoryId: categoryId
        });
        
        if (!found) {
            return res.status(404).json({message: "Category not found"});
        } else {
            await supCategory.deleteOne({
                supplierId: supplierId,
                categoryId: categoryId
            });
            return res.json({message: "Category activated"});
        }
    } catch (error) {
        console.error("activateSupplierCategory error:", error);
        res.status(500).json({ error: "Failed to activate supplier category" });
    }
}


export const deactivateSupplierCategory = async (req, res) => {
    const {supplierId, supplierName, categoryId, categoryName} = req.body;
    try {
        // Check if this specific supplier-category combination already exists
        const found = await supCategory.findOne({
            supplierId: supplierId,
            categoryId: categoryId
        });
        
        if (found) {
            return res.json({message: "Category already deactivated"});
        }
        
        // Create new deactivated category entry
        const newCategory = new supCategory({
            supplierName, 
            supplierId, 
            categoryId, 
            categoryName 
        });
        
        await newCategory.save();
        return res.json({message: "Category deactivated"});
        
    } catch (error) {
        console.error("deactivateSupplierCategory error:", error);
        
        // Handle duplicate key error specifically
        if (error.code === 11000) {
            // If we get a duplicate key error, it means the category is already deactivated
            return res.json({message: "Category already deactivated"});
        }
        
        res.status(500).json({ error: "Failed to deactivate supplier category" });
    }
}

export const getActivatedSupplierCategories = async (req, res) => {
    try {
        const categories = await supCategory.find();
        res.json({data: categories});
    } catch (error) {
        console.error("getActivatedSupplierCategories error:", error);
        res.status(500).json({ error: "Failed to fetch supplier categories" });
    }
}