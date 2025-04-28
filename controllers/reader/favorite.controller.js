import { Book } from "../../models/book.model.js";
import { Favorite } from "../../models/favorite.model.js";
import mongoose from "mongoose";

export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ success: false, message: "Invalid bookId" });
    }

    //Find the book to increase follower
    const book = await Book.findById(bookId);

    //check if book exist
    if (!book) {
      return res.status(400).json({ success: false, message: "Cannot find book" });
    }

    //increase followers of book
    book.followers += 1;

    //save the updated book
    await book.save();

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

    //Find the book to increase follower
    const book = await Book.findById(bookId);

    //check if book exist
    if (!book) {
      return res.status(400).json({ success: false, message: "Cannot find book" });
    }

    //decrease followers of book
    book.followers -= 1;

    //save the updated book
    await book.save();

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

export const checkFavorite = async (req,res) => {
  try {
    const userID = req.user.id;
    const bookID = req.query.bookId;
    //check if book in favorite list
    const favorite = await Favorite.findOne({userId: userID});

    //If user dont have a favorite list, return status: not in favorite
    if(!favorite){
      return res.status(200).json({success: true, status: false});
    }

    //Check if book in user favorite list
    const isFavorite = favorite.bookIds.includes(bookID);

    //If book is not in a favorite list, return status: not in favorite
    if(!isFavorite){
      return res.status(200).json({success: true, status: false});
    }

    //return book in favorite
    res.status(200).json({success: true, status: true});
  } catch (error) {
    console.error("Get favorite error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}