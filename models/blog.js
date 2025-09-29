import mongoose, { Schema } from 'mongoose';

const blogSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
}, { timestamps: true });

const Blog = mongoose.models.blog || mongoose.model('blog', blogSchema);

export default Blog;