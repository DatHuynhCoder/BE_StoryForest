import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { checkDailyCheckIn, dailycheckinPoints } from '../../controllers/reader/dailycheckin.controller.js';
import { checkRole } from '../../middleware/checkRole.js';

const dailycheckinRouter = express.Router();

dailycheckinRouter.post('/', protect, checkRole('admin', 'VIP reader', 'staff', 'reader'), dailycheckinPoints)

dailycheckinRouter.get('/', protect, checkRole('admin', 'VIP reader', 'staff', 'reader'), checkDailyCheckIn)

export default dailycheckinRouter;
