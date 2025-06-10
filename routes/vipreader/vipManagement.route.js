import express from 'express';
import { checkVIPisActive, createVIPSubcriptions } from '../../controllers/vipreader/vipManagement.controller.js';

const vipManagementRouter = express.Router();

//create a new VIP subcription
vipManagementRouter.post('/', createVIPSubcriptions)

//check if user subscription still active
vipManagementRouter.get('/checkvipactive/:userID', checkVIPisActive)

export default vipManagementRouter;