import BestSellerModel from "../models/bestSellers.js";

export const getBestSeller = async (req, res) => {
    try {
        const trendings = await BestSellerModel.find();
        res.status(200).json(trendings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const addBestSeller = async (req, res) => {
    const {productId} = req.body; // Changed from 'id' to 'productId'
    try {
        const found = await BestSellerModel.findOne({productId});
        if(found){
            return res.status(200).json("Already added");
        }
        const newTrending = new BestSellerModel({
            productId // Changed from 'id' to 'productId'
        })
        await newTrending.save();
        res.status(200).json(newTrending);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteBestSeller = async (req, res) => {
    const {productId} = req.body; // Changed from 'id' to 'productId'
    try {
        const found = await BestSellerModel.findOne({productId});
        if(!found){
            return res.status(200).json("Not found");
        }
        await BestSellerModel.findOneAndDelete({productId});
        res.status(200).json("Deleted");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};