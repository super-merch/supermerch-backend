import Blog from "../models/blog.js";
import { v2 as cloudinary } from 'cloudinary';

import slugify from "slugify";

const saveBlog = async (req, res) => {
  try {
    const { content, title, metaTitle, metaDescription } = req.body;

    if (!content || !title) {
      return res.status(400).json({ success: false, message: "Title and content are required" });
    }

    if (!metaTitle || !metaDescription) {
      return res.status(400).json({ success: false, message: "Meta title and description are required" });
    }

    // ✅ Generate slug
    const slug = slugify(title, { lower: true, strict: true });

    // Ensure slug is unique
    const existing = await Blog.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: "A blog with this title already exists" });
    }

    const imageUpload = await cloudinary.uploader.upload(req.file.path, { 
      resource_type: "image",
      timeout: 60000,
      folder: "blogs"
    });

    const blog = await Blog.create({ 
      content, 
      title, 
      metaTitle, 
      metaDescription,
      slug,   // ✅ save slug
      image: imageUpload.secure_url
    });

    res.status(200).json({ success: true, blog, message: "Blog published successfully" });

  } catch (error) {
    console.error("Save blog error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, title, metaTitle, metaDescription } = req.body;
        
        if (!content || !title) {
            return res.status(400).json({ success: false, message: "Title and content are required" });
        }

        if (!metaTitle || !metaDescription) {
            return res.status(400).json({ success: false, message: "Meta title and description are required" });
        }

        // Validate title length
        if (title.length < 10 || title.length > 100) {
            return res.status(400).json({ success: false, message: "Title must be between 10 and 100 characters" });
        }

        const existingBlog = await Blog.findById(id);
        if (!existingBlog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        let imageURL = existingBlog.image;

        try {
            // Handle thumbnail update if new image provided
            if (req.file) {
                // Delete old image from cloudinary
                try {
                    const publicIdMatch = existingBlog.image.match(/\/v\d+\/(.+?)\./);
                    if (publicIdMatch && publicIdMatch[1]) {
                        await cloudinary.uploader.destroy(publicIdMatch[1]);
                    }
                } catch (error) {
                    console.log("Error deleting old image:", error.message);
                }

                // Upload new image
                const imageUpload = await cloudinary.uploader.upload(req.file.path, { 
                    resource_type: "image",
                    timeout: 60000,
                    folder: "blogs"
                });
                imageURL = imageUpload.secure_url;
            }

            const updatedBlog = await Blog.findByIdAndUpdate(
                id,
                { content, title, image: imageURL, metaTitle, metaDescription },
                { new: true, runValidators: true },
                
            );

            res.status(200).json({ 
                success: true, 
                blog: updatedBlog,
                message: "Blog updated successfully"
            });

        } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            return res.status(500).json({ 
                success: false, 
                message: "Image upload failed. Please try with a smaller image." 
            });
        }

    } catch (error) {
        console.error("Update blog error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, blogs });
    } catch (error) {
        console.error("Get blogs error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        
        res.status(200).json({ success: true, blog });
    } catch (error) {
        console.error("Get blog error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ success: false, message: "Blog ID is required" });
        }

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        // Delete thumbnail from cloudinary
        if (blog.image) {
            try {
                const publicIdMatch = blog.image.match(/\/v\d+\/(.+?)\./);
                if (publicIdMatch && publicIdMatch[1]) {
                    await cloudinary.uploader.destroy(publicIdMatch[1]);
                    console.log(`Deleted image: ${publicIdMatch[1]}`);
                }
            } catch (imageError) {
                console.log("Error deleting image from Cloudinary:", imageError.message);
            }
        }

        await Blog.findByIdAndDelete(id);
        
        res.status(200).json({ 
            success: true, 
            message: "Blog deleted successfully" 
        });

    } catch (error) {
        console.error("Delete blog error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export { saveBlog, getBlogs, deleteBlog, updateBlog, getBlogById };