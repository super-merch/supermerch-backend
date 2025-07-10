// utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
let isConnected = false;
const connectCloudinary = async () => {
  if (isConnected) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // e.g., 'your-cloud-name'
    api_key: process.env.CLOUDINARY_API_KEY, // e.g., 'your-api-key'
    api_secret: process.env.CLOUDINARY_API_SECRET, // e.g., 'your-api-secret'
  });

  isConnected = true;
  console.log("Cloudinary connected");

};

export default connectCloudinary;
