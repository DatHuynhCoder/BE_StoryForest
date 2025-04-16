import express from 'express';
// multer to handle file upload

import { getAllManga, getMangaByPage, getMangaDetails, getChaptersByMangaId, getMangaImagesByChapterId } from '../../controllers/manga/manga.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const mangaRouter = express.Router();

// Get all manga
mangaRouter.get('/', getAllManga)
// new Get manga
mangaRouter.get('/v2', getMangaByPage)
// Get manga details by id
mangaRouter.get('/:_id', getMangaDetails)
// Get chapters by mangaid
mangaRouter.get('/:mangaid/chapters', getChaptersByMangaId)
// Get images by chapterid
mangaRouter.get('/:chapterid/images', getMangaImagesByChapterId)
export default mangaRouter;