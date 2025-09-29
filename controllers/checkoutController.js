import { validationResult } from 'express-validator';
import Checkout from '../models/Checkout.js';
import { v2 as cloudinary } from 'cloudinary';
import Quote from '../models/Quote.js';
import mongoose from 'mongoose';
import nodemailer from "nodemailer";
import User from "../models/User.js";

export const createCheckout = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let { orderId, userId, user, billingAddress,
    shippingAddress, products, shipping, discount,
    // tax, 
    total, gst, paymentStatus } =
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
      orderId,
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
      paymentStatus
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
  const {
    page = 1,
    limit = 10,
    search = '',
    status = 'All',
    date = '',
    sortBy = 'orderDate',
    sortOrder = 'desc'
  } = req.query;

  try {
    if (id) {
      const order = await Checkout.findById(id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.status(200).json({ success: true, data: [order] });
    } else {
      // Build query filters
      let query = {};

      // Status filter
      if (status !== 'All') {
        query.status = status;
      }

      // Date filter
      if (date) {
        const filterDate = new Date(date);
        const nextDay = new Date(filterDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query.orderDate = {
          $gte: filterDate,
          $lt: nextDay
        };
      }

      // Build sort object
      const sortObj = {};
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query with pagination
      let ordersQuery = Checkout.find(query)
        .populate('user', 'firstName lastName')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit));

      // Handle search (this needs to be done after population for user name search)
      if (search) {
        const allOrders = await Checkout.find(query)
          .populate('user', 'firstName lastName')
          .sort(sortObj);

        const filteredOrders = allOrders.filter(order => {
          const userName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.toLowerCase();
          const orderId = (order.orderId || order._id).toString().toLowerCase();
          const orderDate = new Date(order.orderDate).toLocaleDateString().toLowerCase();
          const searchLower = search.toLowerCase();

          return userName.includes(searchLower) ||
            orderId.includes(searchLower) ||
            orderDate.includes(searchLower);
        });

        const paginatedOrders = filteredOrders.slice(skip, skip + parseInt(limit));
        const totalOrders = filteredOrders.length;
        const pendingOrders = await Checkout.countDocuments({
          ...query,
          status: { $nin: ['Delivered', 'Cancelled'] }
        });
        const cancelledOrders = await Checkout.countDocuments({ ...query, status: 'Cancelled' });
        const deliveredOrders = await Checkout.countDocuments({ ...query, status: 'Delivered' });

        return res.status(200).json({
          success: true,
          data: paginatedOrders,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalOrders / parseInt(limit)),
            totalOrders,
            hasNextPage: parseInt(page) < Math.ceil(totalOrders / parseInt(limit)),
            hasPrevPage: parseInt(page) > 1
          },
          pendingOrders,
          deliveredOrders,
          cancelledOrders
        });
      }

      const orders = await ordersQuery;
      const totalOrders = await Checkout.countDocuments(query);
      const pendingOrders = await Checkout.countDocuments({
        ...query,
        status: { $nin: ['Delivered', 'Cancelled'] }
      });
      const cancelledOrders = await Checkout.countDocuments({ ...query, status: 'Cancelled' });
      const deliveredOrders = await Checkout.countDocuments({ ...query, status: 'Delivered' });
      res.status(200).json({
        success: true,
        data: orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / parseInt(limit)),
          totalOrders,
          hasNextPage: parseInt(page) < Math.ceil(totalOrders / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        },
        pendingOrders,
        cancelledOrders,
        deliveredOrders
      });
    }
  } catch (error) {
    console.error('Error fetching order data:', error);
    res.status(500).json({ success: false, error: 'Error fetching order data' });
  }
};
//orderstatus change
export const updateOrderStatus = async (req, res) => {
  const { id, paymentStatus } = req.body;
  try {
    const updatedOrder = await Checkout.findByIdAndUpdate(id, { paymentStatus }, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Error updating order status' });
  }
}

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
  const { user, billingAddress, shippingAddress, products } = req.body;

  // Validate required fields
  if (!user || !user.firstName || !user.email || !user.phone) {
    return res.status(400).json({
      error: 'User fields (firstName, email, phone) are required.'
    });
  }

  if (!billingAddress || !billingAddress.addressLine || !billingAddress.country ||
    !billingAddress.state || !billingAddress.city || !billingAddress.postalCode) {
    return res.status(400).json({
      error: 'All billing address fields are required.'
    });
  }

  if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.addressLine ||
    !shippingAddress.country || !shippingAddress.state || !shippingAddress.city ||
    !shippingAddress.postalCode || !shippingAddress.email || !shippingAddress.phone) {
    return res.status(400).json({
      error: 'All shipping address fields are required.'
    });
  }

  try {
    // Find the current checkout to calculate new totals
    const currentCheckout = await Checkout.findById(id);
    if (!currentCheckout) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Calculate new totals if products are updated
    let newTotal = currentCheckout.total;
    let newGst = currentCheckout.gst;

    if (products && products.length > 0) {
      // Recalculate totals based on updated products
      const productsSubtotal = products.reduce((sum, product) => {
        return sum + (product.quantity * product.price);
      }, 0);

      // Recalculate GST (10%)
      newGst = productsSubtotal * 0.10;

      // Apply discount if exists
      const discountAmount = currentCheckout.discount ? (productsSubtotal * currentCheckout.discount / 100) : 0;

      // Calculate new total: subtotal + shipping + gst - discount
      newTotal = productsSubtotal + currentCheckout.shipping + newGst - discountAmount;
    }

    // Update the checkout document
    const updateData = {
      user,
      billingAddress,
      shippingAddress
    };

    // Add products and recalculated totals if products were updated
    if (products && products.length > 0) {
      updateData.products = products;
      updateData.total = newTotal;
      updateData.gst = newGst;
    }

    const updatedCheckout = await Checkout.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Checkout details updated successfully.',
      data: updatedCheckout,
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
  const { name, delivery, email, phone, comment, product, productId, price, quantity, description } = req.body;
  console.log(req.body, req.file, 'req file');

  try {
    if (!name || !email || !delivery || !phone || !comment || !product || !price ||
      !quantity || !description || !productId
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'missing some details' });
    }

    let fileURL;
    if (req.file) {
      // Convert buffer to base64 data URI for Cloudinary upload
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const fileUpload = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'auto', // Changed from 'image' to 'auto' to handle different file types
        folder: 'quotes', // Optional: organize uploads in a folder
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
      product,
      price,
      quantity,
      description,
      productId
    });

    await QuoteSave.save();

    res.json({ success: true, message: 'Request Sent' });
  } catch (error) {
    console.error('Error saving quote:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error saving quote' });
  }
};
export const sendNote = async (req, res) => {
  try {
    const { note, email, user, billingAddress, shippingAddress, products } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Note from Admin",
      html: `
        <div>
          <h2>Order Details</h2>
          <p><strong>Customer:</strong> ${user?.firstName || ""} ${user?.lastName || ""}</p>
          <p><strong>Email:</strong> ${user?.email || ""}</p>
          <p><strong>Phone:</strong> ${user?.phone || ""}</p>

          <h3>Billing Address</h3>
          <p>${billingAddress?.addressLine || ""}, ${billingAddress?.city || ""}, ${billingAddress?.state || ""}, ${billingAddress?.country || ""}, ${billingAddress?.postalCode || ""}</p>

          <h3>Shipping Address</h3>
          <p>${shippingAddress?.addressLine || ""}, ${shippingAddress?.city || ""}, ${shippingAddress?.state || ""}, ${shippingAddress?.country || ""}, ${shippingAddress?.postalCode || ""}</p>

          <h3>Products</h3>
          <ul>
            ${products
              ?.map(
                (p) => `
              <li>
                ${p.name} - Qty: ${p.quantity} - Price: $${p.price}
              </li>
            `
              )
              .join("")}
          </ul>

          <h3>Note</h3>
          <p>${note}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Note sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error sending note" });
  }
};


export const getAllQuotes = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  try {
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Handle search
    if (search) {
      // Fetch all quotes for search filtering
      const allQuotes = await Quote.find({})
        .sort(sortObj);

      const filteredQuotes = allQuotes.filter(quote => {
        const quoteName = (quote.name || '').toLowerCase();
        const quoteEmail = (quote.email || '').toLowerCase();
        const quotePhone = (quote.phone || '').toLowerCase();
        const searchLower = search.toLowerCase();

        return quoteName.includes(searchLower) ||
          quoteEmail.includes(searchLower) ||
          quotePhone.includes(searchLower);
      });

      const paginatedQuotes = filteredQuotes.slice(skip, skip + parseInt(limit));
      const totalQuotes = filteredQuotes.length;

      return res.status(200).json({
        success: true,
        quotes: paginatedQuotes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalQuotes / parseInt(limit)),
          totalQuotes,
          hasNextPage: parseInt(page) < Math.ceil(totalQuotes / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      });
    }

    // Execute query with pagination (no search)
    const quotes = await Quote.find({})
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const totalQuotes = await Quote.countDocuments({});

    res.status(200).json({
      success: true,
      quotes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalQuotes / parseInt(limit)),
        totalQuotes,
        hasNextPage: parseInt(page) < Math.ceil(totalQuotes / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ success: false, error: 'Error fetching quotes' });
  }
};
//delete order by id

// Backend - Improved delete logic
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    // Find and delete the order
    const deletedOrder = await Checkout.findByIdAndDelete(id);

    // Check if order existed
    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting order'
    });
  }
};




export const sendDeliveryEmail = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required in body" });
    }

    // Try to find by Mongo _id if valid, otherwise search by orderId field
    let order = null;
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Checkout.findById(orderId);
    }
    if (!order) {
      order = await Checkout.findOne({ orderId: orderId });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Collect recipients from checkout: user.email, shippingAddress.email, billingAddress.email
    const recipientsSet = new Set();
    if (order.user?.email) recipientsSet.add(order.user.email);
    if (order.shippingAddress?.email) recipientsSet.add(order.shippingAddress.email);
    if (order.billingAddress?.email) recipientsSet.add(order.billingAddress.email);

    const recipients = Array.from(recipientsSet).filter(Boolean);
    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No recipient email found in order (check order.user.email, order.shippingAddress.email, order.billingAddress.email).",
      });
    }

    // Name fallback: order.user -> shippingAddress -> billingAddress -> "Customer"
    const recipientName =
      order.user?.firstName ||
      order.shippingAddress?.firstName ||
      order.billingAddress?.firstName ||
      order.user?.name ||
      "Customer";

    // Build product list HTML
    const productsHtml = (order.products || [])
      .map((p) => {
        const name = p.name || "Product";
        const qty = p.quantity ?? p.qty ?? 1;
        const price = typeof p.price !== "undefined" ? ` — ${p.price}` : "";
        return `<li style="margin-bottom:6px;"><strong>${escapeHtml(
          name
        )}</strong> — Quantity: ${escapeHtml(String(qty))}${price ? ` — Price: ${escapeHtml(String(p.price))}` : ""} $</li>`;
      })
      .join("");

    const orderIdentifier = order.orderId || order._id;
    const deliveredAt = new Date().toLocaleString();

    // Dynamic subject
    const subject = `Super-Merch: Order ${status || "Update"}`;

    // Dynamic message per status
    const statusMessage = (() => {
      switch (status) {
        case "Delivered":
          return "Good news — your order has been <strong>delivered</strong>.";
        case "Artwork Pending":
          return "Your order is currently in <strong>artwork pending</strong> stage. Our team will review and update you soon.";
        case "ArtWork Approved":
          return "Your artwork has been <strong>approved</strong> and we’re moving forward!";
        case "Branding in progress":
          return "Your order is currently <strong>under branding</strong>. We’re working on it.";
        case "Production Complete":
          return "Your order’s <strong>production is complete</strong> and it will move to shipping soon.";
        case "Shipped/In Transit":
          return "Your order has been <strong>shipped</strong> and is on its way!";
        case "Cancelled":
          return "Your order has been <strong>cancelled</strong>. If this was unexpected, please contact our support.";
        case "Returned":
          return "Your order has been <strong>returned</strong>. Please reach out if you need further assistance.";
        case "On Hold":
          return "Your order is currently <strong>on hold</strong>. Our support team may contact you.";
        default:
          return `Your order status has been updated to <strong>${escapeHtml(status || "Unknown")}</strong>.`;
      }
    })();

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <h2>Hi ${escapeHtml(recipientName)},</h2>
        <p>${statusMessage}</p>

        <h3>Order summary</h3>
        <p><strong>Order ID:</strong> ${escapeHtml(String(orderIdentifier))}</p>
        <p><strong>Status Updated At:</strong> ${escapeHtml(deliveredAt)}</p>
        <p><strong>Current Status:</strong> ${escapeHtml(status || "Unknown")}</p>

        <h4>Products</h4>
        <ul style="padding-left: 18px;">
          ${productsHtml || "<li>(No products found)</li>"}
        </ul>

        <h4>Shipping address</h4>
        <p>
          ${escapeHtml(
      [order.shippingAddress?.firstName, order.shippingAddress?.lastName]
        .filter(Boolean)
        .join(" ")
    ) || ""}
          <br/>
          ${escapeHtml(order.shippingAddress?.addressLine || "")}
          <br/>
          ${escapeHtml(
      [order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode]
        .filter(Boolean)
        .join(", ")
    )}
          <br/>
          ${escapeHtml(order.shippingAddress?.country || "")}
        </p>

        <p style="margin-top:12px;">
          If you have any questions, reply to this email or contact our support team.
        </p>

        <p style="margin-top:18px;">Thanks,<br/>SuperMerch</p>
      </div>
    `;


    // Create transporter using Gmail (credentials from env)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send mail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients.join(","),
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Delivery email sent",
      recipients,
      info, // nodemailer response (helpful for debugging)
    });
  } catch (error) {
    console.error("Error sending delivery email:", error);
    return res.status(500).json({ success: false, message: "Error sending delivery email" });
  }
};

/**
 * Simple HTML-escaping to avoid accidental injection via product names etc.
 * (keeps template safe for typical content)
 */
function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
