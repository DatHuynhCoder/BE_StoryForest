import express from 'express';
// multer to handle file upload
import upload from '../../middleware/multer.js';
import { createAuthor, deleteAuthor, getAuthor, updateAuthor } from '../../controllers/staff/author.controller.js';

const authorRouter = express.Router();

//Create an author
authorRouter.post('/', upload.single('avatar'), createAuthor);

//Get a author
authorRouter.get('/:id', getAuthor);

//delete a author
authorRouter.delete('/:id', deleteAuthor);

//update a author
authorRouter.put('/:id', upload.single('avatar'), updateAuthor);

export default authorRouter;