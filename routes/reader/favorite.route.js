import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { addFavorite, deleteFavorite, getFavorite } from '../../controllers/reader/favorite.controller.js';

const favoriteRouter = express.Router();

//Add book(manga, novel)
favoriteRouter.post('/addFavorite', protect, addFavorite);

//Remove book(manga, novel) from favorite
favoriteRouter.delete('/deleteFavorite', protect, deleteFavorite)

//Get all favorite books(manga, novel)
favoriteRouter.get('/getFavorite', protect, getFavorite)

export default favoriteRouter;