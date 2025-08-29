import express from 'express';
import adminMiddlewere from '../middleware/adminMiddlewere.js';
import { deleteBlog, getBlogById, getBlogs, saveBlog, updateBlog } from '../controllers/blogController.js';
import { upload } from '../middleware/multer.js';



const blogRouter = express.Router();

blogRouter.post('/save-blog', upload.single('image'), saveBlog);
blogRouter.get('/get-blogs', getBlogs);
blogRouter.delete('/delete-blog/:id', deleteBlog);
blogRouter.put('/update-blog/:id', upload.single('image'), updateBlog);
blogRouter.get('/get-blog/:id', getBlogById);

export default blogRouter;