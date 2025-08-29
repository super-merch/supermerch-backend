import Blog from "../models/blog.js";
import { v2 as cloudinary } from 'cloudinary'



const saveBlog = async (req, res) => {
    try {
        console.log("Uploaded Files: ", req.file); // Debugging

        const { content, title } = req.body;
        if (!content || !title) return res.status(400).json({ success: false, message: "Missing fields" });

        const image = req.file.path; // Cloudinary URLs

        if (!image) return res.status(400).json({ success: false, message: "Image is required" });

        // if (image) {
        const imageUpload = await cloudinary.uploader.upload(image, { resource_type: "image" });
        const imageURL = imageUpload.secure_url;
        // }

        const blog = await Blog.create({ content, title, image: imageURL });
        res.status(200).json({ success: true, blog });
    } catch (error) {
        console.error(error); // Log the full error
        res.status(500).json({ success: false, message: error.message });
    }
};


const getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ success: false, message: "Blog ID is required" });
        }

        // Find the blog first to get the image URL for cleanup
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        // Extract public_id from Cloudinary URL for cleanup
        if (blog.image) {
            try {
                const imageUrl = blog.image;
                const publicIdMatch = imageUrl.match(/\/v\d+\/(.+?)\./);
                if (publicIdMatch && publicIdMatch[1]) {
                    const publicId = publicIdMatch[1];
                    await cloudinary.uploader.destroy(publicId);
                    console.log(`Deleted image: ${publicId}`);
                }
            } catch (imageError) {
                console.log("Error deleting image from Cloudinary:", imageError.message);
                // Continue with blog deletion even if image deletion fails
            }
        }

        // Delete the blog from database
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


// Add these two new functions to your controller file

const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        
        res.status(200).json({ success: true, blog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, title } = req.body;
        
        if (!content || !title) {
            return res.status(400).json({ success: false, message: "Missing fields" });
        }

        // Find existing blog
        const existingBlog = await Blog.findById(id);
        if (!existingBlog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        let imageURL = existingBlog.image; // Keep existing image by default

        // If new image is uploaded
        if (req.file) {
            // Delete old image from cloudinary
            try {
                const oldImageUrl = existingBlog.image;
                const publicIdMatch = oldImageUrl.match(/\/v\d+\/(.+?)\./);
                if (publicIdMatch && publicIdMatch[1]) {
                    const publicId = publicIdMatch[1];
                    await cloudinary.uploader.destroy(publicId);
                }
            } catch (error) {
                console.log("Error deleting old image:", error.message);
            }

            // Upload new image
            const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
            imageURL = imageUpload.secure_url;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { content, title, image: imageURL },
            { new: true }
        );

        res.status(200).json({ success: true, blog: updatedBlog });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update your export
export { saveBlog, getBlogs, deleteBlog, updateBlog, getBlogById };
