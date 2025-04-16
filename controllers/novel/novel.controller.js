import { Book } from "../../models/book.model.js";
import { NovelChapter } from "../../models/novelchapter.model.js";
import { generatePaginationParams } from "../../utils/generatePaginationParams.js";

export const getAllNovel = async (req, res) => {
    try {
        const novels = await Book.find({ type: "novel" }) // about 100
        if (novels) {
            return res.status(200).json({ success: true, data: novels })
        }
        else {
            return res.status(400).json({ success: false, message: "Invalid novels data" })
        }
    } catch (err) {
        console.log('Error while getting novels: ', err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const getNovelByPage = async (req, res) => {
    try {
        const { page, limit, skip, sortOption } = generatePaginationParams(req.query, ['rate', 'followers', 'views']);

        const novels = await Book.find({ type: "novel" })
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const totalNovels = await Book.countDocuments({ type: "novel" });

        return res.status(200).json({
            success: true,
            data: novels,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalNovels / limit),
                totalItems: totalNovels,
            },
        });
    } catch (err) {
        console.log("Error while getting novels by page: ", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export const getAllCompletedNovel = async (req, res) => {
    try {
        const novels = await Book.find({ type: "novel", status: "completed" }) // about 100
        if (novels) {
            return res.status(200).json({ success: true, data: novels })
        }
        else {
            return res.status(400).json({ success: false, message: "Invalid novels data" })
        }
    } catch (err) {
        console.log('Error while getting novels: ', err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const getAllOngoingNovel = async (req, res) => {
    try {
        const novels = await Book.find({ type: "novel", status: "ongoing" }) // about 100
        if (novels) {
            return res.status(200).json({ success: true, data: novels })
        }
        else {
            return res.status(400).json({ success: false, message: "Invalid novels data" })
        }
    } catch (err) {
        console.log('Error while getting novels: ', err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const getNovelById = async (req, res) => {
    try {
        const { id } = req.params
        const novels = await Book.findById(id).limit(2)
        return res.status(200).json({ success: true, data: novels })
    } catch (err) {
        console.log('Error while getting novels: ', err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const getChaptersByNovelId = async (req, res) => {
    try {
        const { novelid } = req.params
        const chapters = await NovelChapter.find({ novelid: novelid })
        if (chapters) {
            return res.status(200).json({ success: true, data: chapters })
        }
        else {
            return res.status(400).json({ success: false, message: "Invalid chapters data" })
        }
    } catch (err) {
        console.log("Error while getting chapters: ", err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const getChapterByIdAndNovelId = async (req, res) => {
    try {
        const { novelid, chapterid } = req.params
        const chapter = await NovelChapter.find({ _id: chapterid, novelid: novelid })
        if (chapter) {
            return res.status(200).json({ success: true, data: chapter })
        }
        else {
            return res.status(400).json({ success: false, message: "Invalid chapter data" })
        }
    } catch (err) {
        console.log("Error while getting chapters: ", err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}