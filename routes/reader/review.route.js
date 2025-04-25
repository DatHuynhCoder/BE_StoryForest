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

// app.use("/api/reader/review", reviewRouter);

const reviewRouter = express.Router();

//Create an review
reviewRouter.post('/create', createReview);

//Get all review
reviewRouter.get('/all', getAllReviews);

//get review by bookid
reviewRouter.get('/book/:bookid', getReviewsByBookId);

// get review by chapterid
reviewRouter.get('/chapter/:chapterid', getReviewByChapterId);

// get review by userid and chapterid
reviewRouter.get('/user/:userid/:chapterid', getReviewByUserIdAndChapterid);

//delete a review
reviewRouter.delete('/:reviewid', deleteReview);

//update a review
reviewRouter.patch('/:userid/:chapterid', updateReview);

export default reviewRouter;