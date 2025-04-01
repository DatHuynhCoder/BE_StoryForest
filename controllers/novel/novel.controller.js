import { Novel } from "../../models/novel.model.js";

export const getNovelById = async (req, res) => {
    try {
        const { id } = req.params
        const novels = Novel.findById(id).limit(2)
        return res.status(200).json({ success: true, data: novels })
    } catch (err) {
        console.log('Error while getting novels: ', err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}