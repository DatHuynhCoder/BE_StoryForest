import express from 'express';
// multer to handle file upload
import upload from '../../middleware/multer.js';
import { createAccount, loginAccount, deleteAccount, getAllAccount, updateAccount } from '../../controllers/account/account.controller.js';
const accountRouter = express.Router();

//Create an account
accountRouter.post('/register', createAccount);

//Login an account
accountRouter.post('/login', loginAccount);

//Get all account
accountRouter.get('/all', getAllAccount);

//delete a account
accountRouter.delete('/:id', deleteAccount); // hmm

//update a account
accountRouter.put('/:id', updateAccount);

export default accountRouter;