import mongoose from "mongoose";

const AuthorSchema = new mongoose.Schema({
  name: {type: String, required: true},
  avatar: {
    url: String,
    public_id: String
  },
  description: {type: String, required: true}
},{
  timestamps: true
});

export const Author = mongoose.model('Author', AuthorSchema);