import { validationResult } from 'express-validator';
import Checkout from '../models/Checkout.js';
import { v2 as cloudinary } from 'cloudinary';
import Quote from '../models/Quote.js';

export const createCheckout = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let { userId, user, billingAddress, 
    shippingAddress, products, shipping, discount, 
    // tax, 
    total, gst } =
    req.body;
  console.log(userId, 'userId');
  console.log(req.body, 'body');

  products = await Promise.all(
    products.map(async (product) => {
      if (product.logo && !product.logo.startsWith('http')) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(
            product.logo,
            {
              folder: 'logos',
              resource_type: 'image',
            }
          );
          product.logo = uploadResponse.secure_url;
        } catch (error) {
          console.error('Error uploading logo to Cloudinary:', error);
        }
      }
      return product;
    })
  );

  try {
    const checkout = new Checkout({
      userId,
      user,
      // address,
      billingAddress,
      shippingAddress,
      products,
      shipping,
      gst,
      discount,
      // tax,
      total,
    });

    await checkout.save();
    res
      .status(201)
      .json({ message: 'Checkout data saved successfully', checkout });
  } catch (error) {
    console.error('Error saving checkout data:', error);
    res.status(500).json({ error: 'Error saving checkout data' });
  }
};

export const getAllProducts = async (req, res) => {
  const { id } = req.params;

  try {
    if (id) {
      const order = await Checkout.findById(id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.status(200).json({ success: true, data: [order] });
    } else {
      const orders = await Checkout.find();
      res.status(200).json({ success: true, data: orders });
    }
  } catch (error) {
    console.error('Error fetching order data:', error);
    res
      .status(500)
      .json({ success: false, error: 'Error fetching order data' });
  }
};

export const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    const orders = await Checkout.find({ userId });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching order data:', error);
    res
      .status(500)
      .json({ success: false, error: 'Error fetching order data' });
  }
};

// user Admin Pannel
export const updateCheckoutDetails = async (req, res) => {
  const { id } = req.params;
  const { user, address } = req.body;

  if (
    !user ||
    !user.firstName ||
    !user.email ||
    !user.phone ||
    !address ||
    !address.country ||
    !address.state ||
    !address.city ||
    !address.postalCode ||
    !address.addressLine
  ) {
    return res
      .status(400)
      .json({ error: 'All required fields must be provided.' });
  }

  try {
    const updatedCheckout = await Checkout.findByIdAndUpdate(
      id,
      { user, address },
      { new: true, runValidators: true }
    );

    if (!updatedCheckout) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Checkout details updated successfully.',
      updatedCheckout,
    });
  } catch (error) {
    console.error('Error updating checkout details:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// for status update

// Backend route (Express.js example)
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const updatedOrder = await Checkout.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error updating order status' });
  }
};

// for Quote api

export const quoteSaver = async (req, res) => {
  const { name, delivery, email, phone, comment } = req.body;
  console.log(req.body, req.file, 'req file');

  try {
    if (!name || !email || !delivery || !phone || !comment) {
      return res
        .status(400)
        .json({ success: false, message: 'missing some details' });
    }

    let fileURL;
    if (req.file) {
      const fileUpload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'image',
      });
      fileURL = fileUpload.secure_url;
    }

    const QuoteSave = new Quote({
      name,
      email,
      phone,
      delivery,
      file: fileURL,
      comment,
    });


    await QuoteSave.save();

    res.json({ success: true, message: 'Request Sent' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error updating order status' });
  }
};


export const getAllQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({});
    res.status(200).json({ success: true, quotes });
  } catch (error) {
    console.error('Error fetching order data:', error);
    res
      .status(500)
      .json({ success: false, error: 'Error fetching order data' });
  }
}