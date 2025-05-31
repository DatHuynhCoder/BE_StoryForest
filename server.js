import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/connect_DB.js";
import cors from "cors";
import cookieParser from "cookie-parser";

//import Routes
import authorRouter from './routes/staff/author.route.js';
import bookRouter from './routes/staff/book.route.js';
import novelRouter from './routes/novel/novel.route.js';
import mangaRouter from "./routes/manga/manga.route.js";

import chapterRoute from './routes/staff/chapter.route.js';
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

import AdvancedSearchRouter from "./routes/vipreader/advancedSearch.route.js";
import paymentRouter from "./routes/reader/payment.route.js";
import displaydataRouter from "./routes/user/displaydata.route.js";

import { OAuth2Client } from "google-auth-library";

//temp (deleted later)
import { Account } from "./models/account.model.js";

dotenv.config(); // You can access .env vars globally

const app = express();
const client_id = process.env.GG_CLIENT_ID
const client = new OAuth2Client(client_id)

async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: client_id
  })
  const payload = ticket.getPayload()
  // xử lí payload, ví dụ: lưu thông tin người dùng vào database
  return payload
}


//add middeleware
app.use(express.json()); //parse json
app.use(express.urlencoded({ extended: true })); //allow to handle url encoded data
app.use(cookieParser()); //use Cookies to store token
app.use(cors({ origin: "http://localhost:5173", credentials: true })); //allow cross origin request

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Ours Server</h1>");
});

//api for staff
//API author here
app.use("/api/staff/author", authorRouter);

//API book here
app.use("/api/staff/book", bookRouter);

//API chapter here
app.use("/api/staff/chapter", chapterRoute);


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
app.use('/api/user/displaydata', displaydataRouter);

//api for admin
app.use('/api/admin', adminRouter);

app.post('/auth/google-auth', async (req, res) => {
  const { token } = req.body
  const payload = await verifyToken(token)
  const { email, name, sub } = payload

  const accountExists = await Account.findOne({ email });

  if (accountExists) {
    return res.status(201).json({ success: true, data: email, message: 'Account already exists' });
  }

  try {
    const account = await Account.create({
      username: name,
      name: name,
      email: email,
      phone: "",
      password: "******",
      gender: "Không tiện tiết lộ",
      avatar: "",
      role: "reader"
    })
    // const account = await newAccount.save();
    if (account) {
      return res.status(201).json({ success: true, data: email });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid account data' });
    }
  } catch (error) {
    console.error("Error in create account: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
})

app.listen(PORT, () => {
  connectDB();
  console.log(`Server start at http://localhost:${PORT}`);
});