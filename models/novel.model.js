import mongoose, { Schema } from "mongoose";

const NovelSchema = new mongoose.Schema({
    title: { type: String, required: true },
    cover_url: { type: String },
    synopsis: { type: String },
    tags: { type: [String], default: [] },
    status: { type: String },
    author: { type: String },
    rate: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    button_link: { type: String }
}, {
    timestamps: true
})

export const Novel = mongoose.model('Novel', NovelSchema);