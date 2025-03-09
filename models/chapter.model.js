import mongoose, { Schema } from "mongoose";

const ChapterSchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String},
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  pages: {type: Number, required: true},
  dateAdd: {type: Date, default: Date.now },
  contentImgs: [
    {
      url: String,
      public_id: String
    }
  ]
},{
  timestamps: true
});

export const Chapter = mongoose.model('Chapter', ChapterSchema);