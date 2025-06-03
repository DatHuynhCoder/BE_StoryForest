import express from 'express'
import { createMangaChapter, getChaptersByMangaId, getChaptersByNovelId, getMangaImagesByChapterId, deleteMangaChapter, addPageChapter, deletePageChapter, createNovelChapter, editNovelChapter, getNovelChapterById, deleteNovelChapter } from '../../controllers/staff/chapter.controller.js';
import upload from '../../middleware/multer.js'
import { protect } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/checkRole.js';

const chapterRoute = express.Router();

//get mangachapters or novel by id
chapterRoute.get('/:mangaid/chapters', getChaptersByMangaId)

//get novelchapters by id
chapterRoute.get('/:novelid/novelchapters', getChaptersByNovelId)

chapterRoute.get('/:chapterid', getMangaImagesByChapterId)

//create a chapter for manga
chapterRoute.post('/manga', protect, checkRole("admin", "staff"), upload.fields([{ name: 'contentImgs', maxCount: 100 }]), createMangaChapter);

//Delete manga chapter
chapterRoute.delete('/manga/:chapterid', protect, checkRole("admin", "staff"), deleteMangaChapter)

//Add new page to the chapter
chapterRoute.patch('/addpage', protect, checkRole("admin", "staff"), upload.single("pageImg"), addPageChapter)

//Delete a page to the chapter
chapterRoute.patch('/deletepage', protect, checkRole("admin" , "staff"), deletePageChapter)

//Get novel chapter by id
chapterRoute.get('/novel/:chapterid', getNovelChapterById);

//create a chapter for novel
chapterRoute.post('/novel', protect, checkRole("admin","staff"), createNovelChapter);

//Edit a novel chapter
chapterRoute.patch('/novel/:chapterid', protect, checkRole("admin", "staff"), editNovelChapter);

//Delete a novel chapter
chapterRoute.delete('/novel/:chapterid', protect, checkRole("admin", "staff"), deleteNovelChapter);

export default chapterRoute;