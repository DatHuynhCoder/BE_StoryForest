import { BookReview } from "../../models/bookReview.model.js";

export const createReview = async (req, res) => {
    const { name, rating, reviewImg, accountId, bookId } = req.body;
    try {
        const review = await BookReview.create({
            name,
            rating,
            reviewImg,
            accountId,
            bookId
        })
        if (review) {
            return res.status(201).json({ success: true, data: review });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid review data' });
        }
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
        const reviews = await BookReview.find({ bookId: req.params.bookId });
        return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        console.error("Error in get reviews: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export const deleteReview = async (req, res) => {
    try {
        const bookId = req.params.id;
        const bookReview = await BookReview.findById(bookId);

        if (!bookReview) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        await BookReview.findByIdAndDelete(bookId);
        res.status(200).json({ success: true, message: "Review is deleted" });
    } catch (error) {
        console.error("Error in delete review: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export const updateReview = async (req, res) => {
    try {
        // Get review by id
        const reviewId = req.params.id;
        const review = await BookReview.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Update review fields
        const { name, rating, reviewImg, accountId, bookId } = req.body;
        review.name = name || review.name;
        review.rating = rating || review.rating;
        review.reviewImg = reviewImg || review.reviewImg;
        review.accountId = accountId || review.accountId;
        review.bookId = bookId || review.bookId;

        // Save updated review
        const updatedReview = await review.save();
        return res.status(200).json({ success: true, data: updatedReview });
    } catch (error) {
        console.error("Error in update review: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}


