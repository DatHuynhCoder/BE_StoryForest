import mongoose, { Schema } from "mongoose";

const ChapterSchema = new mongoose.Schema({
  name: {type: String, required: true},
  content: {type: String},
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  pages: {type: Number, required: true},
  loveNum: {type: Number, default: 0},
  dateAdd: {type: Date, default: Date.now },
  contentImgs: [
    {
      url: String,
      public_id: String
    }
  ],
  audio: {
    url: String,
    public_id: String
  },
  uploadDate: {type: Date, default: Date.now},
  
},{
  timestamps: true
});

export const Chapter = mongoose.model('Chapter', ChapterSchema);