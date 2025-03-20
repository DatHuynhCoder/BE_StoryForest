import express from 'express';
import { createBook, deleteBook, getBook } from '../../controllers/staff/book.controller.js';
// multer to handle file upload
import upload from '../../middleware/multer.js';

const bookRouter = express.Router();

//Create a book
bookRouter.post('/', upload.single('bookImg'), createBook);

//Get a book
bookRouter.get('/:id', getBook);

//delete a book
bookRouter.delete('/:id', deleteBook);

export default bookRouter;