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

// get all 100 manga from mangadex
app.get("/mangadex/manga", async (req, res) => {
    try {
        const response = await axios.get("https://api.mangadex.org/manga", {
            params: {
                limit: 100, // Get up to 100 manga
                includes: ["cover_art"], // Include cover images
                order: { followedCount: "desc" }, // Order by popularity
            },
        });

        // Extract manga data and format it
        const mangaList = response.data.data.map((manga) => {
            const attributes = manga.attributes;

            // Find cover_art relationship
            const coverArt = manga.relationships.find((rel) => rel.type === "cover_art"); // an object
            const coverId = coverArt ? coverArt.id : null;
            const coverFileName = coverArt?.attributes?.fileName;

            // Construct full cover URL
            const coverUrl = coverFileName
                ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}`
                : null;

            return {
                id: manga.id,
                title: attributes.title.en || "No English Title",
                description: attributes.description.en || "No description available",
                coverUrl,
            };
        });

        res.json(mangaList);
    } catch (error) {
        console.error("Error fetching manga:", error);
        res.status(500).json({ error: "Failed to fetch manga" });
    }
});

app.get("/manga/:mangaId/details", async (req, res) => {
    const mangaId = req.params.mangaId;

    try {
        // Fetch manga details
        const response = await axios.get(`https://api.mangadex.org/manga/${mangaId}`, {
            params: { includes: ["cover_art", "author", "artist"] }, // Get extra details
        });

        const manga = response.data.data;
        const attributes = manga.attributes;

        // Find cover image URL
        const coverArt = manga.relationships.find((rel) => rel.type === "cover_art");
        const coverId = coverArt ? coverArt.id : null;
        const coverUrl = coverId
            ? `https://uploads.mangadex.org/covers/${mangaId}/${coverArt.attributes.fileName}`
            : null;

        // Find authors and artists
        const authors = manga.relationships
            .filter((rel) => rel.type === "author")
            .map((author) => author.attributes.name);

        const artists = manga.relationships
            .filter((rel) => rel.type === "artist")
            .map((artist) => artist.attributes.name);

        // Create a structured response
        const mangaDetails = {
            id: manga.id,
            title: attributes.title.en || attributes.title.ja,
            description: attributes.description.en || "No description available",
            status: attributes.status,
            publicationYear: attributes.year,
            tags: attributes.tags.map((tag) => tag.attributes.name.en),
            authors,
            artists,
            coverUrl,
        };

        res.json(mangaDetails);
    } catch (error) {
        console.error("Error fetching manga details:", error);
        res.status(500).json({ error: "Failed to fetch manga details" });
    }
});

// get 100 chapters of a manga
app.get("/manga/:mangaId/chapters", async (req, res) => {
    const mangaId = req.params.mangaId;

    try {
        const response = await axios.get("https://api.mangadex.org/chapter", {
            params: {
                manga: mangaId,
                limit: 100, // Get up to 100 chapters
                translatedLanguage: ["en"], // Filter by English chapters
                order: { chapter: "asc" }, // Sort by chapter number
            },
        });

        // Extract relevant details
        const chapters = response.data.data.map((chapter) => ({
            id: chapter.id,
            title: chapter.attributes.title,
            chapter: chapter.attributes.chapter,
            volume: chapter.attributes.volume,
            pages: chapter.attributes.pages,
            publishDate: chapter.attributes.publishAt,
        }));

        res.json({ chapters });
    } catch (error) {
        console.error("Error fetching chapters:", error);
        res.status(500).json({ error: "Failed to fetch chapters" });
    }
});

// get images of a chapter
app.get("/mangadex/chapter/:chapterId/images", async (req, res) => {
    const chapterId = req.params.chapterId;

    try {
        // fetch image base URL & hash
        const { data } = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
        const baseUrl = data.baseUrl;
        const hash = data.chapter.hash;
        const images = data.chapter.data; // page images

        // construct full image URLs
        const imagesURL = images.map((img) => `${baseUrl}/data/${hash}/${img}`);
        return res.json({ chapterId, images: imagesURL });
    } catch (error) {
        console.error("Error fetching manga images:", error);
        return res.status(500).json({ error: "Failed to fetch manga images" });
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