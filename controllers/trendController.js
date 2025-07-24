import trendingModel from "../models/trending.js";

export const getTrending = async (req, res) => {
    try {
        const trendings = await trendingModel.find();
        res.status(200).json(trendings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const addTrending = async (req, res) => {
    const {productId} = req.body; // Changed from 'id' to 'productId'
    try {
        const found = await trendingModel.findOne({productId});
        if(found){
            return res.status(200).json("Already added");
        }
        const newTrending = new trendingModel({
            productId // Changed from 'id' to 'productId'
        })
        await newTrending.save();
        res.status(200).json(newTrending);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTrending = async (req, res) => {
    const {productId} = req.body; // Changed from 'id' to 'productId'
    try {
        const found = await trendingModel.findOne({productId});
        if(!found){
            return res.status(200).json("Not found");
        }
        await trendingModel.findOneAndDelete({productId});
        res.status(200).json("Deleted");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};