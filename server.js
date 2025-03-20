import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/connect_DB.js';
import { Account } from './models/account.model.js';
import { BookReview } from './models/bookReview.model.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { protect } from './middleware/authMiddleware.js';

//import Routes
import authorRouter from './routes/staff/author.route.js';
import bookRouter from './routes/staff/book.route.js';
import chapterRoute from './routes/staff/chapter.route.js';

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
// get all accounts
app.get('/api/accounts', protect, async (req, res) => {
  try {
    const accounts = await Account.find({});
    return res.status(200).json({ success: true, data: accounts });
  } catch (error) {
    console.error("Error in get accounts: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
})
// register
app.post('/api/accounts/register', async (req, res) => {
  const { name_account, name, email, phone, password, gender, avatar, role } = req.body;
  // check if account exists
  const accountExists = await Account.findOne({ email });
  if (accountExists) {
    return res.status(400).json({ success: false, message: 'Account already exists' });
  }
  try {
    const account = await Account.create({
      name_account,
      name,
      email,
      phone,
      password,
      gender,
      avatar,
      role
    })
    // const account = await newAccount.save();
    if (account) {
      // use _id to create token
      const token = jwt.sign({ id: account._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      return res.status(201).json({ success: true, data: account, token });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid account data' });
    }
  } catch (error) {
    console.error("Error in create account: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
})
// login
app.post('/api/accounts/login', async (req, res) => {
  const { email, password } = req.body;

  const account = await Account.findOne({ email });

  if (account && (await account.matchPassword(password))) {
    const token = jwt.sign({ id: account._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    // localStorage.setItem('token', token); // use this line is in the frontend
    // const token = localStorage.getItem('token');
    return res.status(200).json({ success: true, data: account, token });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
});
// create review
app.post('/api/comments', protect, async (req, res) => {
  const { name, rating, reviewImg, accountId, bookId } = req.body;
  try {
    const review = await BookReview.create({
      name,
      rating,
      reviewImg,
      accountId,
      bookId
    })
    if (review) {
      return res.status(201).json({ success: true, data: review });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid review data' });
    }
  } catch (error) {
    console.error("Error in create review: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
})

// get all reviews
app.get('/api/comments', protect, async (req, res) => {
  try {
    const reviews = await BookReview.find({});
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error in get reviews: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
})
// get reviews by bookId
app.get('/api/comments/:bookId', protect, async (req, res) => {
  try {
    const reviews = await BookReview.find({ bookId: req.params.bookId });
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error in get reviews: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
})

//API author here
app.use('/staff/author', authorRouter);

//API book here
app.use('/staff/book', bookRouter);

//API chapter here
app.use('/staff/chapter', chapterRoute);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server start at http://localhost:${PORT}`);
})