import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/connect_DB.js';
import { Account } from './models/account.model.js';
import { BookReview } from './models/bookReview.model.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { protect } from './middleware/authMiddleware.js';
import axios from 'axios';

//import Routes
import authorRouter from './routes/staff/author.route.js';
import bookRouter from './routes/staff/book.route.js';
import chapterRoute from './routes/staff/chapter.route.js';
import accountRouter from './routes/account/account.route.js';
import reviewRouter from './routes/review/review.route.js';

// example of how to use the token in the frontend
// fetch('/api/protected-route', {
//     method: 'GET',
//     headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//     }
// })

dotenv.config(); // You can access .env vars globally

const app = express();

//add middeleware
app.use(express.json()); //parse json
app.use(cors()); //allow cross origin request
app.use(express.urlencoded({ extended: true })); //allow to handle url encoded data

const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.send('<h1>Welcome to Ours Server</h1>');
})

app.get("/mangadex/manga", async (req, res) => {
    try {
        const response = await axios.get("https://api.mangadex.org/manga", {
            params: {
                limit: 100, // Get up to 100 manga
                includes: ["cover_art"], // Include cover images
                order: { followedCount: "desc" }, // Order by popularity
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching manga:", error);
        res.status(500).json({ error: "Failed to fetch manga" });
    }
});

app.get("/mangadex/manga/:mangaId/images", async (req, res) => {
    const mangaId = req.params.mangaId;

    try {
        // fetch all chapters of the manga
        const chaptersRes = await axios.get("https://api.mangadex.org/chapter", {
            params: { manga: mangaId, translatedLanguage: ["en"], limit: 20 },
        });

        const chapters = chaptersRes.data.data;

        // fetch images for each chapter
        const imageLinks = await Promise.all(
            chapters.map(async (chapter) => {
                const chapterId = chapter.id;

                // fetch image base URL & hash
                const { data } = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
                const baseUrl = data.baseUrl;
                const hash = data.chapter.hash;
                const images = data.chapter.data; // page images

                // construct full image URLs
                return images.map((img) => `${baseUrl}/data/${hash}/${img}`);
            })
        );

        // flatten array (since each chapter returns an array of images)
        res.json({ images: imageLinks.flat() });
    } catch (error) {
        console.error("Error fetching manga images:", error);
        res.status(500).json({ error: "Failed to fetch manga images" });
    }
});

//API author here
app.use('/staff/author', authorRouter);

//API book here
app.use('/staff/book', bookRouter);

//API chapter here
app.use('/staff/chapter', chapterRoute);

app.use('/account', accountRouter);

app.use('/review', reviewRouter);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server start at http://localhost:${PORT}`);
})