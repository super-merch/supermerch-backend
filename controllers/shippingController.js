import shippingModel from "../models/shippingCharges.js";

export const getShippingCharges = async (req, res) => {
  try {
    const shippingCharges = await shippingModel.findOne();
    if (!shippingCharges) {
      return res.status(200).json({ message: "Shipping charges not found" });
    }
    res.status(200).json(shippingCharges);
  } catch (error) {
    console.error("Error fetching shipping charges:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export const deleteShippingCharges = async (req, res) => {
  try {
    await shippingModel.deleteMany({});
    res.status(200).json({ message: "Shipping charges deleted successfully" });
  } catch (error) {
    console.error("Error deleting shipping charges:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export const addShippingCharges = async (req, res) => {
  const { shipping } = req.body;
  if (shipping === undefined || shipping === null) {
    return res.status(400).json({ message: "Shipping charges are required" });
  }

  try {
    // Delete existing shipping charges
    await shippingModel.deleteMany({});
    
    // Create new shipping charges
    const newShippingCharges = await shippingModel.create({ shipping: Number(shipping) });
    
    res.status(200).json({ 
      data: newShippingCharges, 
      message: "Shipping charges added successfully" 
    });
  } catch (error) {
    console.error("Error adding shipping charges:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}