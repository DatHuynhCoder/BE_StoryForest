import { Book } from "../../models/book.model.js";
import { MangaChapter } from "../../models/mangachapter.model.js";
import { MangaImage } from "../../models/mangaimage.model.js";

export const getAllManga = async (req, res) => {
    try {
        const mangas = await Book.find({ type: "manga" }) // about 100        
        if (mangas) {
            return res.status(200).json({ success: true, data: mangas })
        }
        else {
            return res.status(400).json({ success: false, message: "Invalid mangas data" })
        }
    } catch (err) {
        console.log('Error while getting mangas: ', err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const getMangaDetails = async (req, res) => {
    try {
        const { id } = req.params
        const manga = await Book.findById(id).limit(2)
        return res.status(200).json({ success: true, data: manga })
    } catch (err) {
        console.log('Error while getting mangas: ', err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}
export const getChaptersByMangaId = async (req, res) => {
    try {
        const { mangaid } = req.params
        const chapters = await MangaChapter.find({ mangaid: mangaid })
        return res.status(200).json({ success: true, data: chapters })
    } catch (err) {
        console.log('Error while getting mangas: ', err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const getMangaImagesByChapterId = async (req, res) => {
    try {
        const { chapterid } = req.params
        const images = await MangaImage.find({ chapterId: chapterid })
        return res.status(200).json({ success: true, data: images })
    } catch (err) {
        console.log('Error while getting mangas: ', err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}