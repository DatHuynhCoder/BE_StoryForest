import cloudinary from "../../config/cloudinary.js";
// //delete temp files import
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";

// export const createChapter = async (req, res) => { //limit the number of content images to 100 and audio to 1
//   try {
//     const chapOrder = req.body.chapOrder;
//     //Check if chapter aldready exists
//     const compareChap = await Chapter.findOne({ chapOrder: chapOrder });
//     if (compareChap) {
//       return res.status(400).json({ success: false, message: "Chapter already exists" });
//     }

//     //Upload content images to cloudinay
//     const contentImgFiles = req.files.contentImgs || [];
//     const contentImgs = [];
//     for (const file of contentImgFiles) {
//       const contentImgCloudinary = await cloudinary.uploader.upload(file.path, {
//         folder: 'StoryForest/Chapter',
//         transformation: [
//           { width: 800, height: 800, crop: "limit" },
//           { quality: "auto" },
//           { fetch_format: "auto" }
//         ]
//       });
//       contentImgs.push({
//         url: contentImgCloudinary.secure_url,
//         public_id: contentImgCloudinary.public_id
//       });
//     }

//     //Create new chapter
//     const newChapter = await Chapter.create({
//       name: req.body.name,
//       content: req.body.content,
//       chapOrder: req.body.chapOrder,
//       bookId: req.body.bookId,
//       pages: req.body.pages,
//       dateAdd: req.body.dateAdd,
//       contentImgs: contentImgs,
//       audio: audio
//     })

//     res.status(201).json({ success: true, data: newChapter })

//   } catch (error) {
//     console.error("Error in create chapter: ", error.message);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// }

// export const getChapter = async (req, res) => {
//   try {
//     //get chapter by id
//     const chapterId = req.params.id;
//     const chapter = await Chapter.findById(chapterId);

//     //check if chapter is not found
//     if (!chapter) {
//       return res.status(404).json({ success: false, message: "chapter not found" });
//     }
//     //return chapter
//     return res.status(200).json({ success: true, data: chapter });
//   } catch (error) {
//     console.error("Error in get chapter: ", error.message);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// }

// export const deleteChapter = async (req, res) => {
//   try {
//     const chapterId = req.params.id;
//     const chapter = await Chapter.findById(chapterId);

//     //check if chapter is not found
//     if (!chapter) {
//       return res.status(404).json({ success: false, message: "chapter not found" });
//     }

//     //delete chapter images
//     if(chapter.contentImgs && chapter.contentImgs.length > 0){
//       for(const img of chapter.contentImgs){
//         await cloudinary.uploader.destroy(img.public_id);
//       }
//     }

//     //Delete chapter audio
//     if(chapter.audio && chapter.audio.length > 0){
//       for(const audi of chapter.audio){
//         await cloudinary.uploader.destroy(audi.public_id);
//       }
//     }

//     //delete chapter
//     await Chapter.findByIdAndDelete(chapterId);
//     res.status(200).json({ success: true, message: "Chapter is deleted" });
//   } catch (error) {
//     console.error("Error in delete chapter: ", error.message);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// }

import { Book } from "../../models/book.model.js";
import { MangaChapter } from "../../models/mangachapter.model.js";
import { MangaImage } from "../../models/mangaimage.model.js";
import { NovelChapter } from "../../models/novelchapter.model.js";


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

export const getChaptersByNovelId = async (req, res) => {
  try {
    const { novelid } = req.params
    const chapters = await NovelChapter.find({novelid: novelid}).sort({order: 1});
    const totalChapters = await NovelChapter.countDocuments({novelid: novelid});
    return res.status(200).json({
      success: true,
      data: chapters,
      total: totalChapters
    })
  } catch (err) {
    console.log('Error while getting chapters: ', err.message)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const getChaptersByMangaId = async (req, res) => {
  try {
    const { mangaid } = req.params
    const chapters = await MangaChapter.find({ mangaid: mangaid })
    const totalChapters = await MangaChapter.countDocuments({ mangaid: mangaid });
    return res.status(200).json({
      success: true,
      data: chapters,
      total: totalChapters
    })
  } catch (err) {
    console.log('Error while getting chapters: ', err.message)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const getMangaImagesByChapterId = async (req, res) => {
  try {
    const { chapterid } = req.params
    const images = await MangaImage.find({ chapterId: chapterid })
    return res.status(200).json({
      success: true,
      data: images,
    })
  } catch (err) {
    console.log('Error while getting chapter images: ', err.message)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const createMangaChapter = async (req, res) => {
  try {
    
  } catch (error) {
    console.log('Error while create new manga chapter: ', err.message)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}