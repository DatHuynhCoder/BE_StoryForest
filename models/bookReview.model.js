import mongoose, { Schema } from "mongoose";

const BookReviewSchema = new mongoose.Schema({
  content: { type: String, required: true },
  rating: { type: Number, default: 0 },
  chapterNumber: { type: String },
  chapterTitle: { type: String },
  reviewImg: {
    url: String,
    public_id: String
  },
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  bookId: { type: String, require: true }
}, {
  timestamps: true
});

export const BookReview = mongoose.model('BookReview', BookReviewSchema);