import mongoose, { Schema } from "mongoose";

const BookSchema = new mongoose.Schema({
  name: {type: String, required: true},
  bookImg: {
    url: String,
    public_id: String
  },
  description: {type: String, required: true},
  tag: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Tag',
    }
  ],
  pages: {type: Number, required: true},
  numChapter: {type: Number, required: true},
  vipRequired: {type: Boolean, default: false},
  audio: {
    url: String,
    public_id: String
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref:'Author',
    required: true
  }
},{
  timestamps: true
})

export const Book = mongoose.model('Book', BookSchema);