import cloudinary from "../../config/cloudinary.js";
import { Chapter } from "../../models/chapter.model.js";
//delete temp files import
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";

export const createChapter = async (req, res) => { //limit the number of content images to 100 and audio to 1
  try {
    const chapOrder = req.body.chapOrder;
    //Check if chapter aldready exists
    const compareChap = await Chapter.findOne({ chapOrder: chapOrder });
    if (compareChap) {
      return res.status(400).json({ success: false, message: "Chapter already exists" });
    }

    //Upload content images to cloudinay
    const contentImgFiles = req.files.contentImgs || [];
    const contentImgs = [];
    for (const file of contentImgFiles) {
      const contentImgCloudinary = await cloudinary.uploader.upload(file.path, {
        folder: 'StoryForest/Chapter',
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" }
        ]
      });
      contentImgs.push({
        url: contentImgCloudinary.secure_url,
        public_id: contentImgCloudinary.public_id
      });
    }

    //Upload audio to cloudinary
    const audioFile = req.files.audio || [];
    const audio = [];
    for (const file of audioFile) {
      const audioCloudinary = await cloudinary.uploader.upload(file.path, {
        folder: 'StoryForest/Chapter',
        resource_type: "video",
        format: "mp3",
        audio_codec: "mp3",
        bit_rate: "128k"
      });
      audio.push({
        url: audioCloudinary.secure_url,
        public_id: audioCloudinary.public_id
      });
    }

    //Delete temp uploaded files
    deleteTempFiles([...audioFile, ...contentImgFiles]);

    //Create new chapter
    const newChapter = await Chapter.create({
      name: req.body.name,
      content: req.body.content,
      chapOrder: req.body.chapOrder,
      bookId: req.body.bookId,
      pages: req.body.pages,
      dateAdd: req.body.dateAdd,
      contentImgs: contentImgs,
      audio: audio
    })

    res.status(201).json({ success: true, data: newChapter })

  } catch (error) {
    console.error("Error in create chapter: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getChapter = async (req, res) => {
  try {
    //get chapter by id
    const chapterId = req.params.id;
    const chapter = await Chapter.findById(chapterId);

    //check if chapter is not found
    if (!chapter) {
      return res.status(404).json({ success: false, message: "chapter not found" });
    }
    //return chapter
    return res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    console.error("Error in get chapter: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteChapter = async (req, res) => {
  try {
    const chapterId = req.params.id;
    const chapter = await Chapter.findById(chapterId);

    //check if chapter is not found
    if (!chapter) {
      return res.status(404).json({ success: false, message: "chapter not found" });
    }

    //delete chapter images
    if(chapter.contentImgs && chapter.contentImgs.length > 0){
      for(const img of chapter.contentImgs){
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    //Delete chapter audio
    if(chapter.audio && chapter.audio.length > 0){
      for(const audi of chapter.audio){
        await cloudinary.uploader.destroy(audi.public_id);
      }
    }

    //delete chapter
    await Chapter.findByIdAndDelete(chapterId);
    res.status(200).json({ success: true, message: "Chapter is deleted" });
  } catch (error) {
    console.error("Error in delete chapter: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}