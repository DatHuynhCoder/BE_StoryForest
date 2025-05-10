import express from 'express';
// multer to handle file upload
import upload from '../../middleware/multer.js';
import {
  createAccount,
  loginAccount,
  deleteAccount,
  getAllAccount,
  updateAccount,
  getAccount,
  refreshToken,
  logoutAccount,
  updateAbout,
  changePass,
  upgradeVip
} from '../../controllers/reader/account.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const accountRouter = express.Router();

//Create an account
accountRouter.post('/register', createAccount);

//Login an account
accountRouter.post('/login', loginAccount);

//logout an account
accountRouter.post('/logout', logoutAccount);

//Get all account
accountRouter.get('/all', getAllAccount);

//delete a account
accountRouter.delete('/:id', deleteAccount); // hmm

//update a account
accountRouter.patch('/', protect, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'bgImg', maxCount: 1 }]), updateAccount);

//get account info
accountRouter.get('/', protect, getAccount);

//refresh-token
accountRouter.post('/refresh-token', refreshToken);

//change about
accountRouter.patch('/about', protect, updateAbout);

//change pass
accountRouter.patch('/changepass', protect, changePass);

accountRouter.patch('/upgrade', upgradeVip)

export default accountRouter;