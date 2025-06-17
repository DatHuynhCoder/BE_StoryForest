import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/checkRole.js';
import { getAllVIPReaders } from '../../controllers/staff/vipControl.controller.js';

const vipControlRouter = express.Router();

//Get all VIP users
vipControlRouter.get('/', protect, checkRole('staff','admin'), getAllVIPReaders);

export default vipControlRouter;