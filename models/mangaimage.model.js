import mongoose, { Schema } from "mongoose";

const MangaImageSchema = new mongoose.Schema({
    chapterId: { type: String, required: true },
    images: [{
        url: String,
        public_id: String
    }],
}, {
    timestamps: true
})

export const MangaImage = mongoose.model('MangaImage', MangaImageSchema);