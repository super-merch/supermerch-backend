import express from 'express';
import adminMiddlewere from '../middleware/adminMiddlewere.js';
import { getBlogs, saveBlog } from '../controllers/blogController.js';
import { upload } from '../middleware/multer.js';



const blogRouter = express.Router();

blogRouter.post('/save-blog', upload.single('image'), saveBlog);
blogRouter.get('/get-blogs', getBlogs);


export default blogRouter;