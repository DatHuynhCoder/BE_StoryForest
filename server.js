import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/connect_DB.js";
import { Account } from "./models/account.model.js";
import { BookReview } from "./models/bookReview.model.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import { protect } from "./middleware/authMiddleware.js";
import axios from "axios";
import cookieParser from "cookie-parser";

import { Book } from "./models/book.model.js";

//import Routes
import authorRouter from './routes/staff/author.route.js';
import bookRouter from './routes/staff/book.route.js';
import novelRouter from './routes/novel/novel.route.js';
import chapterRoute from './routes/staff/chapter.route.js';
import accountRouter from './routes/reader/account.route.js';
import reviewRouter from './routes/reader/review.route.js';
import searchRouter from './routes/search.route.js';

// example of how to use the token in the frontend
// fetch('/api/protected-route', {
//     method: 'GET',
//     headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//     }
// })

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

dotenv.config(); // You can access .env vars globally

const app = express();

//add middeleware
app.use(express.json()); //parse json
app.use(express.urlencoded({ extended: true })); //allow to handle url encoded data
app.use(cookieParser()); //use Cookies to store token
app.use(cors({ origin: "http://localhost:5173", credentials: true })); //allow cross origin request

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Ours Server</h1>");
});

// get all 100 manga from mangadex
app.get("/mangadex/manga", async (req, res) => {
  try {
    const response = await axios.get("https://api.mangadex.org/manga", {
      params: {
        limit: 100, // Get up to 100 manga
        includes: ["cover_art", "author", "artist"], // Include cover images
        order: { followedCount: "desc" }, // Order by popularity
      },
    });

    // Extract manga data and format it
    const mangaList = response.data.data.map((manga) => {
      const attributes = manga.attributes;

      //get all tags
      const tag =
        manga.attributes.tags
          ?.map((tag) => tag.attributes.name.en)
          .filter(Boolean) || [];

      // Find cover_art relationship
      const coverArt = manga.relationships.find(
        (rel) => rel.type === "cover_art"
      ); // an object
      const coverId = coverArt ? coverArt.id : null;
      const coverFileName = coverArt?.attributes?.fileName;

      // Construct full cover URL
      const coverUrl = coverFileName
        ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}`
        : null;

      const authors = manga.relationships
        .filter((rel) => rel.type === "author")
        .map((author) => author.attributes.name);

      const artists = manga.relationships
        .filter((rel) => rel.type === "artist")
        .map((artist) => artist.attributes.name);

      return {
        mangaid: manga.id,
        title: attributes.title.en || "No English Title",
        author: authors,
        artist: artists,
        synopsis: attributes.description.en || "No description available",
        tags: tag,
        status: attributes.status,
        type: "manga",
        views: 238,
        followers: 0,
        rate: 5,
        cover_url: coverUrl,
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
    const response = await axios.get(
      `https://api.mangadex.org/manga/${mangaId}`,
      {
        params: { includes: ["cover_art", "author", "artist"] }, // Get extra details
      }
    );

    const manga = response.data.data;
    const attributes = manga.attributes;

    // Find cover image URL
    const coverArt = manga.relationships.find(
      (rel) => rel.type === "cover_art"
    );
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

    // mangaid: manga.id,
    // title: attributes.title.en || "No English Title",
    // author: authors,
    // artist: artists,
    // synopsis: attributes.description.en || "No description available",
    // tags: tag,
    // status: attributes.status,
    // type: "manga",
    // views: 238,
    // followers: 0,
    // rate: 5,
    // cover_url: coverUrl,

    const mangaDetails = {
      mangaid: manga.id,
      title: attributes.title.en || attributes.title.ja,
      author: authors,
      artist: artists,
      synopsis: attributes.description.en || "No description available",
      tags: attributes.tags.map((tag) => tag.attributes.name.en),
      status: attributes.status,
      type: "manga",
      views: 238,
      followers: 0,
      rate: 5,
      cover_url: coverUrl,
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
    const { data } = await axios.get(
      `https://api.mangadex.org/at-home/server/${chapterId}`
    );
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

// get chapters v2
app.get("/v2/manga/:mangaId/chapters", async (req, res) => {
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

    const chapters = response.data.data.map((chapter) => ({
      id: chapter.id,
      title: chapter.attributes.title,
      chapter: chapter.attributes.chapter,
      volume: chapter.attributes.volume,
      pages: chapter.attributes.pages,
      publishDate: chapter.attributes.publishAt,
    }));

    // Fetch images for each chapter concurrently
    const chaptersWithImages = await Promise.all(
      chapters.map(async (chapter) => {
        try {
          const { data } = await axios.get(
            `https://api.mangadex.org/at-home/server/${chapter.id}`
          );
          const baseUrl = data.baseUrl;
          const hash = data.chapter.hash;
          const images = data.chapter.data.map(
            (img) => `${baseUrl}/data/${hash}/${img}`
          );

          return { ...chapter, contentImgs: images };
        } catch (error) {
          console.error(
            `Error fetching images for chapter ${chapter.id}:`,
            error
          );
          return { ...chapter, contentImgs: [] }; // Trả về mảng rỗng nếu lỗi
        }
      })
    );

    res.json({ chapters: chaptersWithImages });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    res.status(500).json({ error: "Failed to fetch chapters" });
  }
});

//API author here
app.use("/api/staff/author", authorRouter);

//API book here
app.use("/api/staff/book", bookRouter);

//API chapter here
app.use("/api/staff/chapter", chapterRoute);

//API update role
app.post("/api/admin/viprole/:id", async (req, res) => {
  try {
    const userID = req.params.id;
    const user = await Account.findById(userID);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    const role = req.body.role;
    user.role = role;

    await user.save();

    res.status(200).json({ success: true, message: `Update role to ${role}` });
  } catch (error) {
    console.error("Error in delete review: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

//api update favorite book
app.post("/api/reader/addfavorite/:id", async (req, res) => {
  try {
    const userID = req.params.id;
    const user = await Account.findById(userID);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    //get bookid
    const bookID = req.body.bookId;
    // Check if the book exists
    const book = await Book.findById(bookID);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    // Check if book is already in favorites
    if (user.favorites.includes(bookID)) {
      return res
        .status(400)
        .json({ success: false, message: "Book is already in favorites" });
    }

    // Add book to favorites
    user.favorites.push(bookID);
    await user.save();

    return res.status(200).json({ success: true, data: "Added to favorites" });
  } catch (error) {
    console.error("Error in delete review: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/suggestion", async (req, res) => {
  try {
    // Lấy từ khóa tìm kiếm từ query string của request (ví dụ: ?q=truyện isekai)
    const query = req.query.q;

    // Gửi yêu cầu đến OpenAI API để tìm kiếm thông tin liên quan trong dữ liệu đã nhúng vector và (tùy chọn) trên web
    const response = await openai.responses.create({
      model: "gpt-4o", // Sử dụng mô hình GPT-4o mới nhất của OpenAI
      tools: [
        {
          type: "file_search", // Tìm kiếm trong dữ liệu đã được nhúng vector trước đó
          vector_store_ids: [process.env.VECTOR_ID], // ID của vector store chứa dữ liệu, được lấy từ biến môi trường
          max_num_results: 20, // Giới hạn tối đa 20 kết quả được trả về
        },
        {
          type: "web_search_preview", // (Tùy chọn) Cho phép tìm kiếm thêm từ web nếu cần
        },
      ],
      input: `
			Search the file data and select at least 2 and at most 10 stories related to: "${query}".  
			Only return a valid JSON string that I can copy entirely without causing any errors.  
			Do not include any text, comments, or markdown symbols.
			Tranla  
			The format must strictly follow this structure:  
			[{"title": "Story Title", "description": "Story Description"}, {"title": "Story Title", "description": "Story Description"}, ...].
			`,
    });

    // Lấy nội dung trả về từ API (dạng chuỗi JSON như đã yêu cầu)
    const rawText = response.output_text;
	console.log(rawText)

    // Chuyển chuỗi JSON thành mảng các đối tượng JavaScript
    const dataObjects = JSON.parse(rawText);

    // Trả dữ liệu về cho client ở dạng JSON
    return res.status(200).json({ success: true, data: dataObjects });
  } catch (error) {
    // In lỗi ra console để dễ debug nếu có sự cố xảy ra (ví dụ: lỗi kết nối, lỗi parse JSON,...)
    console.log("Error while suggesting books: ", error.message);

    // Gửi phản hồi lỗi về phía client
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.use("/api/reader/account", accountRouter);

app.use("/api/reader/review", reviewRouter);

app.use("/api/novel", novelRouter);

app.use('/api/search', searchRouter)

app.listen(PORT, () => {
  connectDB();
  console.log(`Server start at http://localhost:${PORT}`);
});
