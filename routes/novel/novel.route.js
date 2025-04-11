import express from 'express';
// multer to handle file upload
import { getAllNovel, getAllCompletedNovel, getAllOngoingNovel, getNovelById, getChaptersByNovelId, getChapterByIdAndNovelId } from '../../controllers/novel/novel.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const novelRouter = express.Router();

// Get all novels
novelRouter.get('/', getAllNovel)
// Get all completed novels
novelRouter.get('/completed', getAllCompletedNovel)
// Get all ongoing novels
novelRouter.get('/ongoing', getAllOngoingNovel)
//Get novel by id
novelRouter.get('/:id', getNovelById)
// Get chapters by novelid
novelRouter.get('/:novelid/chapters', getChaptersByNovelId)
// Get chapter by _id and novelid
novelRouter.get('/:novelid/:chapterid', getChapterByIdAndNovelId)
export default novelRouter;