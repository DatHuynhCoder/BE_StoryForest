import { Book } from "../models/book.model.js";

export const searchBooks = async (req, res) => {
    try {
        const { keywords } = req.params;

        const books = await Book.find({ title: { $regex: keywords, $options: 'i' } })

        res.status(200).json({ success: true, data: books });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}