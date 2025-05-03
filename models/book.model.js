import mongoose, { Schema } from "mongoose";

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: [String] },
    synopsis: { type: String },
    tags: { type: [String], default: [] },
    status: { type: String },
    views: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    cover_url: { type: String },
    type: { type: String },
    artist: { type: [String], default: [] },
    mangaid: { type: String },
    bookImg: {
        url: String,
        public_id: String
    },
    page: { type: Number }
}, {
    timestamps: true
})

export const Book = mongoose.model('Book', BookSchema);