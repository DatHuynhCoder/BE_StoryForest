import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { addFavorite, checkFavorite, deleteFavorite, getFavorite } from '../../controllers/reader/favorite.controller.js';
import { checkRole } from '../../middleware/checkRole.js';

const favoriteRouter = express.Router();

//Add book(manga, novel)
favoriteRouter.post('/addFavorite', protect, checkRole('admin', 'VIP reader', 'staff', 'reader'), addFavorite);

//Remove book(manga, novel) from favorite
favoriteRouter.delete('/deleteFavorite', protect, checkRole('admin', 'VIP reader', 'staff', 'reader'), deleteFavorite)

//Get all favorite books(manga, novel)
favoriteRouter.get('/getFavorite', protect, checkRole('admin', 'VIP reader', 'staff', 'reader'), getFavorite)

//Check if book in favorite list
favoriteRouter.get('/checkFavorite', protect, checkRole('admin', 'VIP reader', 'staff', 'reader'), checkFavorite)

export default favoriteRouter;