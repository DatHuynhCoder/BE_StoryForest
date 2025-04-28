import { BookReview } from "../../models/bookReview.model.js";

// {
//   content: { type: String, required: true },
//   rating: { type: Number, default: 0 },
//   chapternumber: { type: String },
//   chaptertitle: { type: String },
//   chapterid: { type: String },
//   userid: {
//     type: Schema.Types.ObjectId,
//     ref: 'Account',
//     required: true,
//   },
//   username: { type: String, required: true },
//   bookid: { type: String, require: true }
// }

export const createReview = async (req, res) => {
  const userid = req.user.id
  try {
    const { content, rating, chapternumber, chaptertitle, chapterid, username, bookid } = req.body;

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

    return res.status(201).json({ success: true, data: newReview });
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
      select: 'username avatar' // Replace 'name email' with the fields you want to retrieve from the user model
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
  try {
    const reviewid = req.params.id;
    const review = await BookReview.findById(reviewid);

    // Check if review exists
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Delete the review
    await BookReview.findByIdAndDelete(reviewid);

    return res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
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

    // Save the updated review
    await review.save();

    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error("Error in update review: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}


