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
        // Delete all existing coupons (only one at a time)
        await coupenModel.deleteMany({});
        
        // Create new coupon
        const newCoupon = await coupenModel.create({ 
            coupen: coupen.toUpperCase().trim(), 
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
    try {
        await coupenModel.deleteMany({});
        res.status(200).json({ message: "All coupons deleted successfully" });
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
            coupen: coupen.toUpperCase().trim() 
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

export { getCoupen, addCoupen, deleteCoupen, matchCoupen };