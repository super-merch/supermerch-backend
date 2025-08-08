// seedAdmin.js - Run this once to create the admin
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js'; // Adjust path as needed
import bcrypt from 'bcryptjs';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to your database
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('linkplayer', 10);

    // Create admin
    const admin = new Admin({
      email: 'linkplayer259@gmail.com',
      password: hashedPassword
    });

    await admin.save();
    console.log('Admin created successfully');
    
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();

// To run: node seedAdmin.js