import mongoose, { Schema } from "mongoose";

const BookSchema = new mongoose.Schema({
  name: {type: String, required: true},
  bookImg: {
    url: String,
    public_id: String
  },
  description: {type: String, required: true},
  type: {type: String, enum: ['sách đọc - audio', 'sách tranh'], default: 'sách tranh'},
  tag: {type: [String], default: []},
  pages: {type: Number, required: true},
  status:{type: String, enum: ['ongoing','completed','hiatus']},
  numChapter: {type: Number, required: true},
  vipRequired: {type: Boolean, default: false},
  authorId: {
    type: Schema.Types.ObjectId,
    ref:'Author',
  },
  authors: {type: [String], default: []},
  publishYear: {type: Number, default: 2000},
  rating: {type: Number, default: 0},
  numRate: {type: Number, default: 0},
  views: {type: Number, default: 0},
  contentRating: {type: String, enum: ['safe','suggestive','erotica']}
},{
  timestamps: true
})

export const Book = mongoose.model('Book', BookSchema);