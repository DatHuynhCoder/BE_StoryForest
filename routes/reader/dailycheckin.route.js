import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { checkDailyCheckIn, dailycheckinPoints } from '../../controllers/reader/dailycheckin.controller.js';

const dailycheckinRouter = express.Router();

dailycheckinRouter.post('/', protect, dailycheckinPoints)

dailycheckinRouter.get('/', protect, checkDailyCheckIn)

export default dailycheckinRouter;
