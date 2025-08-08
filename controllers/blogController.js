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


export { saveBlog, getBlogs, deleteBlog };


// const saveBlog = asyncHandler(async (req, res) => {
//     const { content } = req.body;

//     if (!content) {
//         throw new ApiError(400, 'Missing Content');
//     }

//     const blog = await Blog.create({ content });

//     if (!blog) {
//         throw new ApiError(500, 'Error Saving blog');
//     }

//     return res.status(200).send(
//         new ApiResponse(200, blog, 'Blog saved successfully')
//     )

// });
