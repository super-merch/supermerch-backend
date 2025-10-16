import mongoose, { Types } from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  subTotal: { type: Number, required: true },
  color: { type: String, default: "None" },
  print: { type: String, default: "None" },
  logoColor: { type: String, default: "None" },
  logo: { type: String, default: "None", },
  id: { type: String, required: true },
  size: { type: String, default: "None" },
  supplierName: { type: String, required: false },
});

const AddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  addressLine: { type: String, required: true },
  additionl: { type: String },
  companyName: { type: String },
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  addressLine: { type: String, required: true },
  companyName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

const CheckoutSchema = new mongoose.Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
  },
  user: {
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  // address: AddressSchema,
  billingAddress: AddressSchema,
  shippingAddress: shippingAddressSchema,
  products: [ProductSchema],
  artworkOption: { type: String, },
  artworkMessage: { type: String, },
  shipping: { type: Number},
  setupFee:{type: Number},
  gst: { type: Number, required: true },
  discount: { type: Number, required: true },
  // tax: { type: Number, required: true },
  total: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: "Pending" },
  userId: { type: String, },
  paymentStatus: { type: String, default: "Pending" },
  orderId: { type: String, },
  logoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Logos', required: false },

  
});


export default mongoose.model("Checkout", CheckoutSchema);
