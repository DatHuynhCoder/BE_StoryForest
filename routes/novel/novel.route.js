import express from 'express';
// multer to handle file upload

import {
  getAllNovel,
  getNovelByPage,
  getAllCompletedNovel,
  getAllOngoingNovel,
  getOriginalNovel,
  getFanFictionNovel,
  getNovelById,
  getChaptersByNovelId,
  getChapterByIdAndNovelId
} from '../../controllers/novel/novel.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const novelRouter = express.Router();

// Get all novels

novelRouter.get('/', getAllNovel)
// new Get manga
novelRouter.get('/v2', getNovelByPage)
// Get all original status novels
novelRouter.get('/original', getOriginalNovel)
// Get all Fanfiction status novels
novelRouter.get('/fanfiction', getFanFictionNovel)
// Get novel by id
novelRouter.get('/:id', getNovelById)
// Get chapters by novelid
novelRouter.get('/:novelid/chapters', getChaptersByNovelId)
// Get chapter by _id and novelid
novelRouter.get('/:novelid/:chapterid', getChapterByIdAndNovelId)

export default novelRouter;