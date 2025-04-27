import express from 'express';
import { changepassbyOTP, sendOTP, verifyOTP } from '../../controllers/user/accountAction.controller.js';

const accountActionRouter = express.Router();

//send OTP
accountActionRouter.post('/sendOTP', sendOTP)

//verify OTP
accountActionRouter.post('/verifyOTP', verifyOTP)

//change pass by OTP
accountActionRouter.post('/changepassbyOTP', changepassbyOTP)

export default accountActionRouter;