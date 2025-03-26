import express from 'express';
import { createReview, getAllReviews, getReviewsByBookId, deleteReview, updateReview } from '../../controllers/reader/review.controller.js';

const reviewRouter = express.Router();

//Create an review
reviewRouter.post('/create', createReview);

//Get all review
reviewRouter.get('/all', getAllReviews);

//get review by bookId
reviewRouter.get('/:bookId', getReviewsByBookId);

//delete a review
reviewRouter.delete('/:id', deleteReview);

//update a review
reviewRouter.put('/:id', updateReview);

export default reviewRouter;