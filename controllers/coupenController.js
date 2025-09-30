import coupenModel from "../models/coupenModel.js";

const getCoupen = async (req, res) => {
    try {
        const coupons = await coupenModel.find();
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const addCoupen = async (req, res) => {
    const { coupen, discount } = req.body;
    
    // Validation
    if (!coupen || !discount) {
        return res.status(400).json({ message: "Coupon code and discount are required" });
    }
    
    if (discount <= 0 || discount > 100) {
        return res.status(400).json({ message: "Discount must be between 1 and 100" });
    }
    
    try {
        const couponCode = coupen.toUpperCase().trim();
        
        // Check if coupon already exists
        const existingCoupon = await coupenModel.findOne({ coupen: couponCode });
        if (existingCoupon) {
            return res.status(400).json({ message: "Coupon code already exists" });
        }
        
        // Create new coupon (isActive defaults to true)
        const newCoupon = await coupenModel.create({ 
            coupen: couponCode, 
            discount: Number(discount) 
        });
        
        res.status(200).json({ 
            data: newCoupon, 
            message: "Coupon added successfully" 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteCoupen = async (req, res) => {
    const { id } = req.params;
    
    try {
        if (!id) {
            // If no ID provided, delete all coupons (for backward compatibility)
            await coupenModel.deleteMany({});
            res.status(200).json({ message: "All coupons deleted successfully" });
        } else {
            // Delete specific coupon by ID
            const deletedCoupon = await coupenModel.findByIdAndDelete(id);
            if (!deletedCoupon) {
                return res.status(404).json({ message: "Coupon not found" });
            }
            res.status(200).json({ message: "Coupon deleted successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const matchCoupen = async (req, res) => {
    try {
        const { coupen } = req.body;
        
        if (!coupen) {
            return res.status(400).json({ message: "Coupon code is required" });
        }
        
        const foundCoupon = await coupenModel.findOne({ 
            coupen: coupen.toUpperCase().trim(),
            isActive: true // Only match active coupons
        });
        
        if (foundCoupon) {
            res.status(200).json({ 
                valid: true, 
                coupon: foundCoupon,
                discount: foundCoupon.discount,
                message: "Coupon is valid" 
            });
        } else {
            res.status(404).json({ 
                valid: false, 
                message: "Invalid coupon code" 
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// New function to toggle coupon active status
const toggleCoupenStatus = async (req, res) => {
    const { id } = req.params;
    
    try {
        const coupon = await coupenModel.findById(id);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }
        
        // Toggle the isActive status
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        
        const statusText = coupon.isActive ? "activated" : "deactivated";
        res.status(200).json({ 
            data: coupon,
            message: `Coupon ${statusText} successfully` 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { getCoupen, addCoupen, deleteCoupen, matchCoupen, toggleCoupenStatus };