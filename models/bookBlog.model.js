import mongoose from "mongoose";

const BookBlogSchema = new mongoose.Schema({
});

//have not decided yet

export const BookBlog = mongoose.model('BookBlog', BookBlogSchema);