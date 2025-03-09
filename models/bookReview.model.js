import mongoose, { Schema } from "mongoose";

const BookReviewSchema = new mongoose.Schema({
  name: {type: String, required: true},
  rating: {type: Number, default: 0},
  reviewImg: {
    url: String,
    public_id: String
  },
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  }
},{
  timestamps: true
});

export const BookReview = mongoose.model('BookReview', BookReviewSchema);