import subscriptionModel from "../models/subscriptionModel.js";

export const addEmail = async(req, res) => {
    try {
        const { email } = req.body;
        const exists = await subscriptionModel.findOne({email})
        if(exists){
            return res.status(200).json({success: false, message: "Email already exists"})
        }
        const newEmail = new subscriptionModel({email})
        await newEmail.save()
        res.status(200).json({success: true, message: "Email added successfully"})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}