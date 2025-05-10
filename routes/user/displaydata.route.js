import express from 'express'
import { accountInfo } from '../../controllers/user/displaydata.controller.js';

const displaydataRouter = express.Router();

//display account info (anyone)
displaydataRouter.get('/account/:id', accountInfo)

export default displaydataRouter;