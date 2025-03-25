import mongoose, { Schema } from "mongoose";

const ChapterSchema = new mongoose.Schema({
  name: {type: String, default: "Không tiêu đề"},
  content: {type: String, default:""},
  chapOrder: {type: String, default: "x"},
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  pages: {type: Number},
  loveNum: {type: Number, default: 0},
  dateAdd: {type: Date, default: Date.now },
  contentImgs: [
    {
      order: Number,
      url: String,
      public_id: String
    }
  ],
  audio: [{
    url: String,
    public_id: String
  }],
},{
  timestamps: true
});

export const Chapter = mongoose.model('Chapter', ChapterSchema);