import express from 'express';
import {
  createReview,
  getAllReviews,
  getReviewsByBookId,
  getReviewByChapterId,
  getReviewByUserIdAndChapterid,
  deleteReview,
  updateReview
} from '../../controllers/reader/review.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/checkRole.js';

const reviewRouter = express.Router();

//Create an review
reviewRouter.post('/create', protect, checkRole('admin', 'VIP reader', 'staff', 'reader'), createReview);

//Get all review
reviewRouter.get('/all', getAllReviews);

//get review by bookid
reviewRouter.get('/book/:bookid', getReviewsByBookId);

// get review by chapterid
reviewRouter.get('/chapter/:chapterid', getReviewByChapterId);

// get review by userid and chapterid
reviewRouter.get('/user/:userid/:chapterid', getReviewByUserIdAndChapterid);

//delete a review
reviewRouter.delete('/:id', protect, checkRole('admin', 'VIP reader', 'staff', 'reader'), deleteReview);

//update a review
reviewRouter.patch('/:userid/:chapterid', protect, checkRole('admin', 'VIP reader', 'staff', 'reader'), updateReview);

export default reviewRouter;