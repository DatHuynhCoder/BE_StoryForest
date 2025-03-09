import mongoose from "mongoose";

const AuthorSchema = new mongoose.Schema({
  name: {type: String, required: true},
  avatar: {
    url: String,
    required: true
  },
  description: {type: String, required: true}
},{
  timestamps: true
});

export const Author = mongoose.model('Author', AuthorSchema);