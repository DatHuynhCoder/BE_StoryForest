import express from 'express';
// multer to handle file upload
import { getNovelById } from '../../controllers/novel/novel.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const novelRouter = express.Router();

//Get novel by id
novelRouter.get('/:id', getNovelById);

export default novelRouter;