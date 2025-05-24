// import { createChapter, deleteChapter, getChapter } from '../../controllers/staff/chapter.controller.js';

// //Create a chapter
// chapterRoute.post('/', upload.fields([{ name: 'contentImgs', maxCount: 100 }, { name: 'audio', maxCount: 1 }]), createChapter);

// //Delete a chapter
// chapterRoute.delete('/:id', deleteChapter);

// export default chapterRoute;

import express from 'express'
import { createMangaChapter, getChaptersByMangaId, getChaptersByNovelId, getMangaImagesByChapterId } from '../../controllers/staff/chapter.controller.js';
import upload from '../../middleware/multer.js'

const chapterRoute = express.Router();

//get mangachapters or novel by id
chapterRoute.get('/:mangaid/chapters', getChaptersByMangaId)

//get novelchapters by id
chapterRoute.get('/:novelid/novelchapters', getChaptersByNovelId)

chapterRoute.get('/:chapterid', getMangaImagesByChapterId)

//create a chapter for manga
chapterRoute.post('/', upload.fields([{ name: 'contentImgs', maxCount: 100 }]), createMangaChapter);

export default chapterRoute;