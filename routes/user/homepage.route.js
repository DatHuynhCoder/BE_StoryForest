import express from 'express'
import { getHomepage } from '../../controllers/user/homepage.controller.js';

const homepageRouter = express.Router()

//Get Homepage details infomation
homepageRouter.get('/', getHomepage)

export default homepageRouter;