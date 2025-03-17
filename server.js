import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/connect_DB.js';
import { Account } from './models/account.model.js';
import { Book } from './models/book.model.js';
import e from 'express';

dotenv.config(); // You can access .env vars globally

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.send('<h1>Welcome to Ours Server</h1>');
})

app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = await Account.find({});
        return res.status(200).json({ success: true, data: accounts });
    } catch (error) {
        console.error("Error in get accounts: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
})

app.post('/api/accounts', async (req, res) => {
    try {
        const newAccount = await Account.create({
            name_account: req.body.name_account,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            gender: req.body.gender,
            avatar: req.body.avatar,
            role: req.body.role
        })
        const account = await newAccount.save();
        return res.status(201).json({ success: true, data: account });
    } catch (error) {
        console.error("Error in create account: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
})

app.listen(PORT, () => {
    connectDB();
    console.log(`Server start at http://localhost:${PORT}`);
})