import express from 'express';
import { createTextToSpeak } from '../../controllers/vipreader/texttospeak.controller.js';
import { protect } from '../../middleware/authMiddleware.js'; // Assuming you have a middleware for authentication

const texttospeakRouter = express.Router();

// Create text to speak a novel chapter
texttospeakRouter.post('/',protect, createTextToSpeak);

export default texttospeakRouter;