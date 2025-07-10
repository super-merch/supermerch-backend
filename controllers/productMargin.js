import addMarginModel from "../models/addMargin.js";
import ProductDiscountModel from "../models/ProductDiscount.js";


export const addMargin = async (req, res) => {
  const { productId, margin, basePrice } = req.body;

  if (!productId || margin === undefined || basePrice === undefined) {
    return res
      .status(400)
      .json({ message: 'Product ID, margin, and base price are required' });
  }

  try {
    // 1️⃣ Check for an existing discount
    const existingDiscount = await ProductDiscountModel.findOne({ productId });

    const priceForMargin = existingDiscount
      ? existingDiscount.discountPrice
      : basePrice;

    const marginPrice = priceForMargin + margin;

    // 4️⃣ Upsert the margin document
    let marginRecord = await addMarginModel.findOne({ productId });
    if (marginRecord) {
      marginRecord.margin = margin;
      marginRecord.marginPrice = marginPrice;
      await marginRecord.save();
      return res.status(200).json({
        message: 'Margin updated successfully',
        data: marginRecord,
      });
    }

    marginRecord = new addMarginModel({
      productId,
      margin,
      marginPrice,
    });
    await marginRecord.save();
    return res.status(201).json({
      message: 'Margin added successfully',
      data: marginRecord,
    });
  } catch (error) {
    console.error('Error adding margin:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};




export const getMarginByProductId = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    const marginEntry = await addMarginModel.findOne({ productId });

    if (!marginEntry) {
      return res
        .status(404)
        .json({ message: 'Margin not found for this product' });
    }

    res.status(200).json({
      message: 'Margin fetched successfully',
      data: marginEntry,
    });
  } catch (error) {
    console.error('Error fetching margin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





export const listMargin = async (req, res) => {
  try {
    const margins = await addMarginModel.find({});
    res.status(200).json({ success: true, margins });
  } catch (error) {
    console.error('Error fetching margins:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};