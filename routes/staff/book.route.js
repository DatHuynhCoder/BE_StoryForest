import express from 'express';
import { createBook, deleteBook, getBook, updateBook, getAllBooks } from '../../controllers/staff/book.controller.js';
// multer to handle file upload
import upload from '../../middleware/multer.js';
import { protect } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/checkRole.js';

const bookRouter = express.Router();

// Get all books
bookRouter.get("/allbooks", getAllBooks);
//Create a book
bookRouter.post('/', protect, checkRole('admin', 'staff'), upload.single('bookImg'), createBook);

//Get a book
bookRouter.get('/:id', getBook);

//delete a book
bookRouter.delete('/:id', protect, checkRole('admin', 'staff'), deleteBook);

//update a book
bookRouter.patch('/:id', protect, checkRole('admin', 'staff'), upload.single('bookImg'), updateBook)

export default bookRouter;