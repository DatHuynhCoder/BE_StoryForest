import mongoose, { Schema } from "mongoose";

const BookReviewSchema = new mongoose.Schema({
  content: { type: String, required: true },
  rating: { type: Number, default: 0 },
  chapternumber: { type: String },
  chaptertitle: { type: String },
  chapterid: { type: String },
  userid: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  username: { type: String, required: true },
  bookid: { type: String, require: true }
}, {
  timestamps: true
});

export const BookReview = mongoose.model('BookReview', BookReviewSchema);