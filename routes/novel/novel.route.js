import express from 'express';
// multer to handle file upload
import { getAllNovel, getNovelById, getChaptersByNovelId, getChapterByIdAndNovelId } from '../../controllers/novel/novel.controller.js';

const novelRouter = express.Router();

// Get all novels
novelRouter.get('/',getAllNovel)
//Get novel by id
novelRouter.get('/:id', getNovelById)
// Get chapters by novelid
novelRouter.get('/:novelid/chapters', getChaptersByNovelId)
// Get chapter by _id and novelid
novelRouter.get('/:novelid/:chapterid', getChapterByIdAndNovelId)
export default novelRouter;