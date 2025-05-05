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

//api for reader
app.use("/api/reader/account", accountRouter);

app.use("/api/reader/favorite", favoriteRouter);

app.use("/api/reader/review", reviewRouter);

app.use("/api/reader/dailycheckin", dailycheckinRouter)

app.use("/api/novel", novelRouter);

app.use("/api/manga", mangaRouter);

app.use('/api/search', searchRouter);

//api for VIP reader
app.use('/api/vipreader/texttospeak', texttospeakRouter);

//api for user
app.use('/api/user/homepage', homepageRouter);
app.use('/api/user/accountAction', accountActionRouter);

const YOUR_DOMAIN = 'http://localhost:5173/payment';

app.post('/create-payment-link', protect, async (req, res) => {
  const userid = req.user.id
  // Generate a unique orderCode using timestamp and random number
  const orderCode = Number(`${Date.now()}${Math.floor(10 + Math.random() * 90)}`); // Example: 16832012345671234
  const order = {
    orderCode: orderCode,
    amount: 2000,
    description: "Thanh toan don hang",
    items: [
      {
        name: "Không vip đời không nể",
        quantity: 1,
        price: 2000,
      },
    ],
    returnUrl: `${YOUR_DOMAIN}/success?userid=${userid}`,
    cancelUrl: `${YOUR_DOMAIN}/cancel`,
  };
  const paymentLink = await payos.createPaymentLink(order);
  return res.json({ url: paymentLink.checkoutUrl });
})

// webhook-url using ngrok
// ex: https://a6d5-14-186-73-60.ngrok-free.app/payment-callback
app.post('/payment-callback', async (req, res) => {
  console.log(req.body)
  return res.json()
})


app.listen(PORT, () => {
  connectDB();
  console.log(`Server start at http://localhost:${PORT}`);
});

app.use('/api/admin', adminRouter);

