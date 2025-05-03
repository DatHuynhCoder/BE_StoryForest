import express from 'express';
// multer to handle file upload
import { searchBooks } from '../controllers/search.controller.js';
const searchRouter = express.Router();

searchRouter.get('/:keywords', searchBooks);

export default searchRouter;