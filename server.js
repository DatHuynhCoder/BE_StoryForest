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
import crypto from "crypto";
import moment from "moment";
import PayOS from "@payos/node";

import { Book } from "./models/book.model.js";

//import Routes
import authorRouter from './routes/staff/author.route.js';
import bookRouter from './routes/staff/book.route.js';
import novelRouter from './routes/novel/novel.route.js';
import mangaRouter from "./routes/manga/manga.route.js";
// import chapterRoute from './routes/staff/chapter.route.js';
import accountRouter from './routes/reader/account.route.js';
import reviewRouter from './routes/reader/review.route.js';
import favoriteRouter from './routes/reader/favorite.route.js';
import searchRouter from './routes/search.route.js';
import texttospeakRouter from "./routes/vipreader/texttospeak.route.js";
import homepageRouter from "./routes/user/homepage.route.js";
import accountActionRouter from "./routes/user/accountAction.route.js";
import dailycheckinRouter from "./routes/reader/dailycheckin.route.js";

// admin 
import adminRouter from "./routes/admin/admin.route.js";
import dashboardRouter from "./routes/admin/dashboard.route.js";

import OpenAI from "openai";
import AdvancedSearchRouter from "./routes/vipreader/advancedSearch.route.js";
import paymentRouter from "./routes/reader/payment.route.js";

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

const payos = new PayOS('596f2353-7de4-42b8-84ae-217713f717be', '41b0b93f-1fe2-4b40-81d8-96a22b2fee24', '0eed5dc90388324ce053997e49ba6765130e5eff3c661a9f595086847a4d1c17')

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Ours Server</h1>");
});

//API author here
app.use("/api/staff/author", authorRouter);

//API book here
app.use("/api/staff/book", bookRouter);

//API chapter here
// app.use("/api/staff/chapter", chapterRoute);

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


//api for reader
app.use("/api/reader/account", accountRouter);

app.use("/api/reader/favorite", favoriteRouter);

app.use("/api/reader/review", reviewRouter);

app.use("/api/reader/dailycheckin", dailycheckinRouter)

app.use("/api/reader/payment", paymentRouter)

app.use("/api/novel", novelRouter);

app.use("/api/manga", mangaRouter);

app.use('/api/search', searchRouter);

//api for VIP reader
app.use('/api/vipreader/texttospeak', texttospeakRouter);
app.use("/api/vipreader/advanced-search", AdvancedSearchRouter)

//api for user
app.use('/api/user/homepage', homepageRouter);
app.use('/api/user/accountAction', accountActionRouter);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server start at http://localhost:${PORT}`);
});


