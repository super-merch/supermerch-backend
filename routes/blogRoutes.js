import express from 'express';
import adminMiddlewere from '../middleware/adminMiddlewere.js';
import { deleteBlog, getBlogById, getBlogs, saveBlog, updateBlog } from '../controllers/blogController.js';
import { upload } from '../middleware/multer.js';

const blogRouter = express.Router();

// Updated to handle multiple files - main image + additional images
blogRouter.post('/save-blog', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
]), saveBlog);

blogRouter.get('/get-blogs', getBlogs);
blogRouter.delete('/delete-blog/:id', deleteBlog);

blogRouter.put('/update-blog/:id', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
]), updateBlog);

blogRouter.get('/get-blog/:id', getBlogById);

export default blogRouter;