import mongoose from "mongoose";

const TagSchema = new mongoose.Schema({
  name: {type: String, require: true}
},{
  timestamps: true
});

export const Tag = mongoose.model('Tag', TagSchema);