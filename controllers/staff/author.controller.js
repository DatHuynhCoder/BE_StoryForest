import cloudinary from "../../config/cloudinary.js";
//delete temp files import
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";
import { Author } from "../../models/author.model.js";
import * as streamifier from 'streamifier';

export const createAuthor = async (req, res) => {
  try {
    //Upload author avatar to cloudinary
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Author avatar is required" });
    }

    const avatarCloudinary = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "StoryForest/Author",
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

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream)
    });

    //get the public_id and url of the image
    const avatar = {
      url: avatarCloudinary.secure_url,
      public_id: avatarCloudinary.public_id
    };


    //create an author
    const newAuthor = await Author.create({
      name: req.body.name,
      avatar,
      description: req.body.description
    });

    res.status(201).json({ success: true, data: newAuthor });
  } catch (error) {
    console.error("Error in create author: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getAuthor = async (req, res) => {
  try {
    //get author by id
    const authorId = req.params.id;
    const author = await Author.findById(authorId);

    //check if author not found
    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }

    //return author
    res.status(200).json({ success: true, data: author });
  } catch (error) {
    console.error("Error in get author: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteAuthor = async (req, res) => {
  try {
    //get author by id
    const authorId = req.params.id;
    const author = await Author.findById(authorId);

    // check if author not found
    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }
    //delete author avatar in cloudinary
    await cloudinary.uploader.destroy(author.avatar.public_id);

    //remove the author
    await Author.findByIdAndDelete(authorId);
    res.status(200).json({ success: true, message: "Author is deleted" });
  } catch (error) {
    console.error("Error in delete author: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateAuthor = async (req, res) => {
  try {
    // Get author by id
    const authorId = req.params.id;
    const author = await Author.findById(authorId);

    //check if author not found
    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }

    let updateData = { ...req.body }; // Copy data from req.body

    // Upload author avatar to cloudinary
    if (req.file) {
      // Delete old avatar
      await cloudinary.uploader.destroy(author.avatar.public_id);


      //upload new Avatar
      const avatarCloudinary = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "StoryForest/Author",
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
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream)
      });

      // Add new avatar info to updateData
      updateData.avatar = {
        url: avatarCloudinary.secure_url,
        public_id: avatarCloudinary.public_id
      };

    }

    // Update author
    const updatedAuthor = await Author.findByIdAndUpdate(authorId, updateData, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: updatedAuthor });
  } catch (error) {
    console.error("Error in update author: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}