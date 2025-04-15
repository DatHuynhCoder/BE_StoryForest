import { Favorite } from "../../models/favorite.model.js";
import mongoose from "mongoose";

export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ success: false, message: "Invalid bookId" });
    }

    const favorite = await Favorite.findOneAndUpdate(
      { userId },
      { $addToSet: { bookIds: bookId } }, // addToSet để tránh trùng
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: favorite });
  } catch (error) {
    console.error("Add to favorite error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    const favorite = await Favorite.findOneAndUpdate(
      { userId },
      { $pull: { bookIds: bookId } },
      { new: true }
    );

    res.status(200).json({ success: true, data: favorite });
  } catch (error) {
    console.error("Delete favorite error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ userId: req.user.id }).populate('bookIds');
    
    if (!favorite) {
      return res.status(404).json({ success: false, message: "No favorites found" });
    }

    res.status(200).json({ success: true, data: favorite.bookIds });
  } catch (error) {
    console.error("Get favorite error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}