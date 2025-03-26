import express from 'express';
// multer to handle file upload
import { createAccount, loginAccount, deleteAccount, getAllAccount, updateAccount } from '../../controllers/reader/account.controller.js';
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