import Blog from "../models/blog.js";
import { v2 as cloudinary } from 'cloudinary'

const saveBlog = async (req, res) => {
    try {
        console.log("Uploaded Files: ", req.files);

        const { content, title } = req.body;
        if (!content || !title) return res.status(400).json({ success: false, message: "Missing fields" });

        const mainImage = req.files?.image?.[0];
        const additionalImages = req.files?.additionalImages || [];

        if (!mainImage) return res.status(400).json({ success: false, message: "Main image is required" });

        try {
            // Upload main image with timeout configuration
            const imageUpload = await cloudinary.uploader.upload(mainImage.path, { 
                resource_type: "image",
                timeout: 60000 // 60 seconds timeout
            });
            const imageURL = imageUpload.secure_url;

            // Upload additional images in parallel with error handling
            const additionalImagePromises = additionalImages.map(file => 
                cloudinary.uploader.upload(file.path, { 
                    resource_type: "image",
                    timeout: 60000
                }).catch(error => {
                    console.error(`Failed to upload additional image ${file.originalname}:`, error);
                    return null; // Return null for failed uploads
                })
            );

            const additionalImageResults = await Promise.all(additionalImagePromises);
            const additionalImageURLs = additionalImageResults
                .filter(result => result !== null) // Filter out failed uploads
                .map(result => result.secure_url);

            const blog = await Blog.create({ 
                content, 
                title, 
                image: imageURL,
                additionalImages: additionalImageURLs
            });
            
            // Log if some additional images failed
            const failedUploads = additionalImages.length - additionalImageURLs.length;
            if (failedUploads > 0) {
                console.log(`Warning: ${failedUploads} additional images failed to upload`);
            }
            
            res.status(200).json({ 
                success: true, 
                blog,
                message: failedUploads > 0 ? `Blog saved successfully, but ${failedUploads} additional images failed to upload` : "Blog saved successfully"
            });
            
        } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            return res.status(500).json({ 
                success: false, 
                message: "Image upload failed. Please try with smaller images or check your internet connection." 
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, title, keepExistingImages } = req.body;
        
        if (!content || !title) {
            return res.status(400).json({ success: false, message: "Missing fields" });
        }

        // Find existing blog
        const existingBlog = await Blog.findById(id);
        if (!existingBlog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        let imageURL = existingBlog.image;
        let additionalImageURLs = [];

        try {
            // Handle main image update
            if (req.files?.image?.[0]) {
                // Delete old main image
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

                // Upload new main image
                const imageUpload = await cloudinary.uploader.upload(req.files.image[0].path, { 
                    resource_type: "image",
                    timeout: 60000
                });
                imageURL = imageUpload.secure_url;
            }

            // Handle additional images
            const existingImagesToKeep = keepExistingImages ? JSON.parse(keepExistingImages) : [];
            const imagesToDelete = (existingBlog.additionalImages || []).filter(img => !existingImagesToKeep.includes(img));
            
            // Delete removed images from cloudinary
            const deletePromises = imagesToDelete.map(async (imageUrl) => {
                try {
                    const publicIdMatch = imageUrl.match(/\/v\d+\/(.+?)\./);
                    if (publicIdMatch && publicIdMatch[1]) {
                        const publicId = publicIdMatch[1];
                        await cloudinary.uploader.destroy(publicId);
                        console.log(`Deleted removed image: ${publicId}`);
                    }
                } catch (error) {
                    console.log("Error deleting removed image:", error.message);
                }
            });
            await Promise.all(deletePromises);

            // Start with existing images to keep
            additionalImageURLs = [...existingImagesToKeep];

            // Upload new additional images if any
            if (req.files?.additionalImages && req.files.additionalImages.length > 0) {
                const additionalImagePromises = req.files.additionalImages.map(file => 
                    cloudinary.uploader.upload(file.path, { 
                        resource_type: "image",
                        timeout: 60000
                    }).catch(error => {
                        console.error(`Failed to upload additional image ${file.originalname}:`, error);
                        return null;
                    })
                );

                const additionalImageResults = await Promise.all(additionalImagePromises);
                const newImageURLs = additionalImageResults
                    .filter(result => result !== null)
                    .map(result => result.secure_url);
                
                // Add new images to existing ones
                additionalImageURLs = [...additionalImageURLs, ...newImageURLs];
            }

            const updatedBlog = await Blog.findByIdAndUpdate(
                id,
                { 
                    content, 
                    title, 
                    image: imageURL,
                    additionalImages: additionalImageURLs
                },
                { new: true }
            );

            res.status(200).json({ success: true, blog: updatedBlog });

        } catch (uploadError) {
            console.error("Cloudinary upload error during update:", uploadError);
            return res.status(500).json({ 
                success: false, 
                message: "Image upload failed during update. Please try with smaller images." 
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Rest of your functions remain the same...
const getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

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

        // Delete main image
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
                console.log("Error deleting main image from Cloudinary:", imageError.message);
            }
        }

        // Delete additional images
        const deletePromises = (blog.additionalImages || []).map(async (imageUrl) => {
            try {
                const publicIdMatch = imageUrl.match(/\/v\d+\/(.+?)\./);
                if (publicIdMatch && publicIdMatch[1]) {
                    const publicId = publicIdMatch[1];
                    await cloudinary.uploader.destroy(publicId);
                    console.log(`Deleted additional image: ${publicId}`);
                }
            } catch (imageError) {
                console.log("Error deleting additional image from Cloudinary:", imageError.message);
            }
        });

        await Promise.all(deletePromises);

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