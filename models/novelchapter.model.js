import mongoose, { Schema } from "mongoose";

const NovelChapterSchema = new mongoose.Schema({
    order: { type: Number, required: true },
    novelid: { type: String, required: true },
    chapter_title: { type: String },
    chapter_link: { type: String },
    chapter_content: { type: [String], default: [] },
}, {
    timestamps: true
})

export const NovelChapter = mongoose.model('NovelChapter', NovelChapterSchema);