import { Book } from "../../models/book.model.js";
import { MangaChapter } from "../../models/mangachapter.model.js";
import { MangaImage } from "../../models/mangaimage.model.js";
import {
    generatePaginationParams,
    generatePaginationParamsForFilter
} from "../../utils/pagination.js";

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

export const getMangaWithFilter = async (req, res) => {
    try {
        const { page, limit, skip, sortOption } = generatePaginationParamsForFilter(req.query, ['rate', 'followers', 'views']);

        const mangas = await Book.find({ type: "manga" })
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const totalMangas = await Book.countDocuments({ type: "manga" });

        return res.status(200).json({
            success: true,
            data: mangas,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMangas / limit),
                totalItems: totalMangas,
            },
        });
    } catch (err) {
        console.log('Error while getting mangas by page: ', err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export const getMangaByStatus = async (req, res) => {
    try {
        const status = req.query.status

        const { page, limit, skip } = generatePaginationParams(req.query)

        if (!status) {
            return res.status(400).json({ success: false, message: "Status query parameter is required" });
        }

        const mangas = await Book.find({ type: "manga", status: status })
            .skip(skip)
            .limit(limit)

        const totalMangas = await Book.countDocuments({ type: "manga", status: status })

        return res.status(200).json({
            success: true,
            data: mangas,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMangas / limit),
                totalItems: totalMangas,
            }
        })
    } catch (err) {
        console.log('Error while getting mangas by status: ', err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const getMangaDetails = async (req, res) => {
    try {
        const { _id } = req.params
        const manga = await Book.findById(_id).limit(2)
        const chapters = await MangaChapter.find({ mangaid: manga.mangaid })
        return res.status(200).json({ success: true, data: { manga, chapters } })
    } catch (err) {
        console.log('Error while getting manga details: ', err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}
export const getChaptersByMangaId = async (req, res) => {
    try {
        const { mangaid } = req.params
        const chapters = await MangaChapter.find({ mangaid: mangaid })
        return res.status(200).json({ success: true, data: chapters })
    } catch (err) {
        console.log('Error while getting chapters: ', err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const getMangaImagesByChapterId = async (req, res) => {
    try {
        const { chapterid } = req.params
        const images = await MangaImage.find({ chapterId: chapterid })
        return res.status(200).json({ success: true, data: images })
    } catch (err) {
        console.log('Error while getting chapter images: ', err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}