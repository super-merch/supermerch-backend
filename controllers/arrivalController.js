import arrivalModel from "../models/arrival.js";

export const getArrival = async (req, res) => {
    try {
        const trendings = await arrivalModel.find();
        res.status(200).json(trendings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const addArrival = async (req, res) => {
    const {productId} = req.body; // Changed from 'id' to 'productId'
    try {
        const found = await arrivalModel.findOne({productId});
        if(found){
            return res.status(200).json("Already added");
        }
        const newTrending = new arrivalModel({
            productId // Changed from 'id' to 'productId'
        })
        await newTrending.save();
        res.status(200).json(newTrending);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteArrival = async (req, res) => {
    const {productId} = req.body; // Changed from 'id' to 'productId'
    try {
        const found = await arrivalModel.findOne({productId});
        if(!found){
            return res.status(200).json("Not found");
        }
        await arrivalModel.findOneAndDelete({productId});
        res.status(200).json("Deleted");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};