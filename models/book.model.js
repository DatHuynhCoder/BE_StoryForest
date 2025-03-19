import mongoose, { Schema } from "mongoose";

const BookSchema = new mongoose.Schema({
  name: {type: String, required: true},
  bookImg: {
    url: String,
    public_id: String
  },
  description: {type: String, required: true},
  type: {type: String, enum: ['sách đọc - audio', 'sách tranh']},
  tag: {type: [String], default: []},
  pages: {type: Number, required: true},
  status:{type: String, enum: ['Đang tiếp tục','Đã hoàn thành','Tạm ngưng']},
  numChapter: {type: Number, required: true},
  vipRequired: {type: Boolean, default: false},
  authorId: {
    type: Schema.Types.ObjectId,
    ref:'Author',
    required: true
  },
  publishDate: {type: Date, default: Date.now},
  rating: {type: Number, default: 0},
  numRate: {type: Number, default: 0},
  views: {type: Number, default: 0},
},{
  timestamps: true
})

export const Book = mongoose.model('Book', BookSchema);