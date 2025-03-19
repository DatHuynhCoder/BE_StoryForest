import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/connect_DB.js';
import { Account } from './models/account.model.js';
import cors from 'cors';

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

app.get('/api/accounts', async (req, res) => {
  try {
    const accounts = await Account.find({});
    res.status(200).json({ success: true, data: accounts });
  } catch (error) {
    console.error("Error in get accounts: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
})

app.listen(PORT, () => {
  connectDB();
  console.log(`Server start at http://localhost:${PORT}`);
})