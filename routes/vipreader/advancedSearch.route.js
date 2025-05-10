import express from 'express';
import { protect } from '../../middleware/authMiddleware.js'; // Assuming you have a middleware for authentication
import { AdvancedSearch } from '../../controllers/vipreader/advancedSearch.controller.js';

const AdvancedSearchRouter = express.Router();

// AdvancedSearchRouter.post('/',protect, AdvancedSearchController);
AdvancedSearchRouter.post('/', AdvancedSearch);

export default AdvancedSearchRouter;