import mongoose, { Schema } from "mongoose";

const MangaImageSchema = new mongoose.Schema({
    chapterId: { type: String, required: true },
    images: { type: [String] },
}, {
    timestamps: true
})

export const MangaImage = mongoose.model('MangaImage', MangaImageSchema);