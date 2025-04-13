import mongoose, { Schema } from "mongoose";

const MangaChapterSchema = new mongoose.Schema({
    chapterid: { type: String, required: true },
    title: { type: String },
    chapter: { type: String },
    volume: { type: String },
    pages: { type: Number },
    publishDate: { type: String },
    mangaid: { type: String, required: true },
}, {
    timestamps: true
})

export const MangaChapter = mongoose.model('MangaChapter', MangaChapterSchema);