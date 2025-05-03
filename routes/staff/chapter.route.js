// import express from 'express';
// // multer to handle file upload
// import upload from '../../middleware/multer.js';
// import { createChapter, deleteChapter, getChapter } from '../../controllers/staff/chapter.controller.js';

// const chapterRoute = express.Router();

// //Create a chapter
// chapterRoute.post('/', upload.fields([{ name: 'contentImgs', maxCount: 100 }, { name: 'audio', maxCount: 1 }]), createChapter);

// //Get a chapter
// chapterRoute.get('/:id', getChapter);

// //Delete a chapter
// chapterRoute.delete('/:id', deleteChapter);

// export default chapterRoute;