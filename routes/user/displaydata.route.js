import express from 'express'
import { accountInfo, getAnyFavorite } from '../../controllers/user/displaydata.controller.js';

const displaydataRouter = express.Router();

//display account info (anyone)
displaydataRouter.get('/account/:id', accountInfo)

//get any favorite account books
displaydataRouter.get('/favorite/:id', getAnyFavorite);

export default displaydataRouter;