import cloudinary from "../../config/cloudinary.js";
// //delete temp files import
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";
import { Book } from "../../models/book.model.js";
import { MangaChapter } from "../../models/mangachapter.model.js";
import { MangaImage } from "../../models/mangaimage.model.js";
import { NovelChapter } from "../../models/novelchapter.model.js";
import { randomString } from "../../utils/randomString.js";
import * as streamifier from 'streamifier';


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
    const chapters = await NovelChapter.find({ novelid: novelid }).sort({ order: 1 });
    const totalChapters = await NovelChapter.countDocuments({ novelid: novelid });
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

export const getNovelChapterById = async (req, res) => {
  try {
    const { chapterid } = req.params
    const chapter = await NovelChapter.findById(chapterid);
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Chapter not found" });
    }
    return res.status(200).json({
      success: true,
      data: chapter,
    })
  } catch (err) {
    console.log('Error while getting novel chapter: ', err.message)
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
    //get infomation
    const { title, chapter, volume } = req.body;

    //upload mangaimgs to cloudinary
    const mangaFiles = req.files['contentImgs'] || [];
    const mangaImgs = [];
    for (const file of mangaFiles) {
      const mangaImg = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "StoryForest/Chapter",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

      mangaImgs.push(mangaImg.secure_url + "@" + mangaImg.public_id);
    }

    //create new manga chapter
    const newChapter = await MangaChapter.create({
      title,
      chapter,
      volume,
      pages: mangaImgs.length,
      publishDate: new Date().toISOString(),
      mangaid: req.body.mangaid,
      chapterid: `${randomString(20)}-${Date.now()}`
    });

    //create new manga images
    await MangaImage.create({
      chapterId: newChapter.chapterid,
      images: mangaImgs
    });

    //return the new chapter
    return res.status(201).json({
      success: true,
      data: newChapter,
      message: "New manga chapter created successfully"
    });
  } catch (err) {
    console.log('Error while create new manga chapter: ', err.message)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const deleteMangaChapter = async (req, res) => {
  try {
    const chapterid = req.params.chapterid;

    //find the chapter
    const chapter = await MangaChapter.findOne({ chapterid: chapterid });
    if (!chapter) {
      return res.status(400).json({ success: false, message: "Can't not find the chapter" });
    }

    //Delete all manga images
    const mangaImages = await MangaImage.findOne({ chapterId: chapter.chapterid });
    if (mangaImages && mangaImages.images && mangaImages.images.length > 0) {
      for (const img of mangaImages.images) {
        if (img.includes('@')) {
          const public_id = img.split('@')[1];
          await cloudinary.uploader.destroy(public_id);
        }
      }
    }
    await MangaImage.deleteOne({ chapterId: chapter.chapterid });

    //Delete the chapter
    await MangaChapter.deleteOne({ chapterid: chapter.chapterid });
    return res.status(200).json({ success: true, message: "Chapter deleted successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const addPageChapter = async (req, res) => {
  try {
    let { chapterid, pageindex } = req.body;

    // Ép kiểu pageindex
    pageindex = parseInt(pageindex);

    if (isNaN(pageindex)) {
      return res.status(400).json({ success: false, message: "Invalid page index" });
    }

    //find the chapter image
    const chapterImages = await MangaImage.findOne({ chapterId: chapterid });
    if (!chapterImages) {
      return res.status(400).json({ success: false, message: "Can't not find the chapter" });
    }

    //find the chapter
    const chapter = await MangaChapter.findOne({ chapterid: chapterid });
    if (!chapter) {
      return res.status(400).json({ success: false, message: "Can't not find the chapter" });
    }

    //Upload pageImg to cloudinary
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Chapter image is required" });
    }

    const pageImgCloudinary = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "StoryForest/Chapter",
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    //add to the chapter images with pageindex
    const pageImg = pageImgCloudinary.secure_url + "@" + pageImgCloudinary.public_id;
    chapterImages.images.splice(pageindex, 0, pageImg);

    await chapterImages.save();

    //update the chapter pages
    chapter.pages = chapterImages.images.length;
    await chapter.save();

    return res.status(200).json({
      success: true,
      message: "New page added successfully",
    });
  } catch (error) {
    console.log('Error while adding page to chapter: ', error.message);
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const deletePageChapter = async (req, res) => {
  try {
    let { chapterid, pageindex } = req.body;

    // Ép kiểu pageindex
    pageindex = parseInt(pageindex);

    if (isNaN(pageindex)) {
      return res.status(400).json({ success: false, message: "Invalid page index" });
    }

    //find the chapter image
    const chapterImages = await MangaImage.findOne({ chapterId: chapterid });
    if (!chapterImages) {
      return res.status(400).json({ success: false, message: "Can't not find the chapter" });
    }

    //find the chapter
    const chapter = await MangaChapter.findOne({ chapterid: chapterid });
    if (!chapter) {
      return res.status(400).json({ success: false, message: "Can't not find the chapter" });
    }

    //Get the public_id if image is on cloudinary and delete it on cloudinary
    if (chapterImages.images[pageindex].includes("@")) {
      const public_id = chapterImages.images[pageindex].split("@")[1];
      await cloudinary.uploader.destroy(public_id);
    }

    //Delete image link from images array
    chapterImages.images.splice(pageindex, 1);
    await chapterImages.save();

    //update the chapter pages
    chapter.pages = chapterImages.images.length;
    await chapter.save();

    res.status(200).json({ success: true, message: "Delete page successfully" });
  } catch (error) {
    console.log('Error while adding page to chapter: ', error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const createNovelChapter = async (req, res) => {
  try {
    //get novel information
    const { order, novelid, chapter_title, chapter_content } = req.body;

    //check if the chapter already exists
    const existingChapter = await NovelChapter.findOne({ order, novelid });
    if (existingChapter) {
      return res.status(400).json({ success: false, message: "Chapter already exists" });
    }

    //create new novel chapter
    const newChapter = await NovelChapter.create({
      order,
      novelid,
      chapter_title,
      chapter_content: chapter_content ? chapter_content.split('\n') : [],
    });
    return res.status(201).json({
      success: true,
      data: newChapter,
      message: "New novel chapter created successfully"
    });

  } catch (error) {
    console.log('Error while adding novel chapter: ', error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const editNovelChapter = async (req, res) => {
  try {
    const { chapterid } = req.params;
    //get update data
    const updateData = { ...req.body };

    //find the chapter
    const chapter = await NovelChapter.findOne({ _id: chapterid });
    if (!chapter) {
      return res.status(400).json({ success: false, message: "Can't not find the chapter" });
    }

    //handle chapter content
    if (updateData.chapter_content) {
      updateData.chapter_content = updateData.chapter_content.split('\n');
    }
    //update the chapter
    await NovelChapter.findByIdAndUpdate(chapterid, updateData, { new: true });
    return res.status(200).json({
      success: true,
      message: "Chapter updated successfully"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteNovelChapter = async (req, res) => {
  try {
    const { chapterid } = req.params;

    //find the chapter
    const chapter = await NovelChapter.findById(chapterid);
    if (!chapter) {
      return res.status(400).json({ success: false, message: "Can't not find the chapter" });
    }

    //Delete the chapter
    await NovelChapter.deleteOne({ _id: chapterid });
    return res.status(200).json({ success: true, message: "Chapter deleted successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}