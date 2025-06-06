import { BookReview } from "../../models/bookReview.model.js";
import { Account } from "../../models/account.model.js";
import { changeExp, checkLevelChange } from "../../utils/levelSystem.js";
import { Book } from "../../models/book.model.js";
import mongoose from "mongoose";

export const createReview = async (req, res) => {
  const userid = req.user.id
  try {
    const { content, chapternumber, chaptertitle, chapterid, username, bookid } = req.body;
    let { rating } = req.body
    //Get the user to increase exp
    const user = await Account.findById(req.user.id).select("exp level rank");


    //check if rating is valid 
    if (rating) {
      try {
        rating = parseFloat(rating);
      } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid rating value" });
      }

      if (rating < 0 || rating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be between 0 and 5" });
      }

      //Get the book
      const book = await Book.findById(bookid);
      if (!book) {
        return res.status(404).json({ success: false, message: "Book not found" });
      }

      //get number of reviews
      const numReviews = await BookReview.countDocuments({ bookid: bookid });

      //update the book's rating
      const newRating = ((book.rate * numReviews) + rating) / (numReviews + 1);
      book.rate = newRating;
      await book.save();
    }

    //increase exp of user
    const newexp = changeExp('comment', user.exp, req.user.role);
    user.exp = newexp;
    //check level change
    const { level, rank } = checkLevelChange(user.exp);
    user.level = level;
    user.rank = rank;

    //save the updated user
    await user.save();
    // Create a new review
    const newReview = await BookReview.create({
      content,
      rating,
      chapternumber,
      chaptertitle,
      chapterid,
      userid,
      username,
      bookid
    });

    return res.status(201).json({ success: true, data: newReview, user: user });
  } catch (error) {
    console.error("Error in create review: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await BookReview.find({});
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error in get reviews: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getReviewsByBookId = async (req, res) => {
  try {
    const reviews = await BookReview.find({ bookid: req.params.bookid }).populate({
      path: 'userid',
      select: 'username avatar' // Replace 'name email' with the fields you want to retrieve from the user model
    });
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error in get reviews: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getReviewByChapterId = async (req, res) => {
  try {
    const reviews = await BookReview.find({ chapterid: req.params.chapterid }).populate({
      path: 'userid',
      select: 'username avatar level' // Replace 'name email' with the fields you want to retrieve from the user model
    });
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error in get reviews: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
  // try {
  //   const reviews = await BookReview.find({ chapterid: req.params.chapterid });
  //   return res.status(200).json({ success: true, data: reviews });
  // } catch (error) {
  //   console.error("Error in get reviews: ", error.message);
  //   return res.status(500).json({ success: false, message: "Server error" });
  // }
}

export const getReviewByUserIdAndChapterid = async (req, res) => {
  try {
    const { userid, chapterid } = req.params;
    const reviews = await BookReview.find({ userid, chapterid });
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error in get reviews: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteReview = async (req, res) => {
  const reviewid = req.params.id;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const review = await BookReview.findById(reviewid).session(session);

    // Check if review exists
    if (!review) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // recalculate the book's rating if the review has a rating
    if (review.rating) {
      const book = await Book.findById(review.bookid).session(session);

      if (!book) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: "Book not found" });
      }

      // Get the number of reviews before deletion
      const numReviews = await BookReview.countDocuments({ bookid: book._id }).session(session);;

      // If there are no reviews left, set the rating to 0
      if (numReviews <= 1) {
        book.rate = 0;
      } else {
        // Recalculate the rating
        const remainingReviews = await BookReview.find({
          bookid: book._id,
          _id: { $ne: reviewid }
        }).session(session);
        const totalRating = remainingReviews.reduce((acc, review) => acc + (review.rating || 0), 0);
        book.rate = totalRating / (numReviews - 1);
      }

      // Save the updated book rating
      await book.save({ session });
    }

    // Delete the review
    await BookReview.findByIdAndDelete(reviewid).session(session);;

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in delete review: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateReview = async (req, res) => {
  try {
    const { userid, chapterid } = req.params;
    const { content, rating } = req.body;

    // Find the review by userid and chapterid
    const review = await BookReview.findOne({ userid, chapterid });

    // Check if review exists
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Update the review's content and rating
    review.content = content || review.content;
    review.rating = rating !== undefined ? rating : review.rating;

    //Update the book's rating if the rating is provided
    if (review.rating) {
      let oldRating = review.rating;
      // Get the book
      const book = await Book.findById(review.bookid);
      if (!book) {
        return res.status(404).json({ success: false, message: "Book not found" });
      }

      // Get the total number of reviews for this book
      const numReviews = await BookReview.countDocuments({ bookid: review.bookid });

      if (numReviews > 0) {
        if (oldRating) {
          const newRating = ((book.rating * numReviews) - oldRating + rating) / numReviews;
          book.rating = newRating;
        } else {
          const newRating = ((book.rating * (numReviews - 1)) + rating) / numReviews;
          book.rating = newRating;
        }
      } else {
        book.rating = rating;
      }

      // Save the updated book rating
      await book.save();
    }

    // Save the updated review
    await review.save();

    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error("Error in update review: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}


