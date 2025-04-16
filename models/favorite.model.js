import mongoose, { Schema } from "mongoose";

const FavoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
    unique: true
  },
  bookIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book"
    }
  ]
}, {
  timestamps: true
});

export const Favorite = mongoose.model('Favorite', FavoriteSchema);