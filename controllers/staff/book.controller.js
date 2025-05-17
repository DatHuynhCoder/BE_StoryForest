import cloudinary from "../../config/cloudinary.js";
import { Book } from "../../models/book.model.js";
//delete temp files import
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";


export const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sort = 'newest' } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    // Xác định cách sắp xếp
    let sortOption = { updatedAt: -1 }; // Mặc định: mới nhất
    if (sort === 'oldest') {
      sortOption = { updatedAt: 1 };
    } else if (sort === 'a-z') {
      sortOption = { title: 1 };
    } else if (sort === 'z-a') {
      sortOption = { title: -1 };
    }
    
    const books = await Book.find(query, 'title cover_url updatedAt')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortOption);
      
    const total = await Book.countDocuments(query);
    
    res.status(200).json({ 
      success: true, 
      data: books,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error("Error in getAllBooks:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const createBook = async (req, res) => {
  try {
    //Parse tag string to array
    let tag = [];
    if (req.body.tag) {
      try {
        tag = typeof req.body.tag === 'string' ? JSON.parse(req.body.tag) : req.body.tag;
      } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid tag data" });
      }
    }

    //Upload book image to cloudinary
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Book image is required" });
    }
    const bookImgCloudinary = await cloudinary.uploader.upload(req.file.path, {
      folder: 'StoryForest/Book',
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });

    //get the public_id and url of the image
    const bookImg = {
      url: bookImgCloudinary.secure_url,
      public_id: bookImgCloudinary.public_id
    };

    //delete the temp file
    req.file && deleteTempFiles([req.file]);

    //create a book
    const newBook = await Book.create({
      name: req.body.name,
      bookImg,
      description: req.body.description,
      type: req.body.type,
      tag,
      pages: req.body.pages,
      status: req.body.status,
      numChapter: req.body.numChapter,
      authorId: req.body.authorId,
      publishDate: req.body.publishDate,
    });

    res.status(201).json({ success: true, data: newBook });
  } catch (error) {
    console.error("Error in create book: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getBook = async (req, res) => {
  try {
    //get book by id
    const bookId = req.params.id;
    const book = await Book.findById(bookId); //Use populate to get author name from Author
    //If you delete the author, the authorId in the book will be null

    //check if book not found
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    //return book
    return res.status(200).json({ success: true, data: book });
  } catch (error) {
    console.error("Error in get book: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);

    //check if book not found
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    //delete book image in cloudinary
    await cloudinary.uploader.destroy(book.bookImg.public_id);

    //remove the book
    await Book.findByIdAndDelete(bookId);

    res.status(200).json({ success: true, message: "Book is deleted" });
  } catch (error) {
    console.error("Error in delete book: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    let book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    // Parse tag
    let tag = [];
    if (req.body.tag) {
      try {
        tag = typeof req.body.tag === 'string' ? JSON.parse(req.body.tag) : req.body.tag;
      } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid tag data" });
      }
    }

    let updatedData = {
      name: req.body.name || book.name,
      description: req.body.description || book.description,
      type: req.body.type || book.type,
      tag: tag.length ? tag : book.tag,
      pages: req.body.pages || book.pages,
      status: req.body.status || book.status,
      numChapter: req.body.numChapter || book.numChapter,
      authorId: req.body.authorId || book.authorId,
      publishDate: req.body.publishDate || book.publishDate,
    };

    // If new image is uploaded
    if (req.file) {
      // Delete old image
      await cloudinary.uploader.destroy(book.bookImg.public_id);

      // Upload new image
      const uploadedImg = await cloudinary.uploader.upload(req.file.path, {
        folder: 'StoryForest/Book',
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" }
        ]
      });

      updatedData.bookImg = {
        url: uploadedImg.secure_url,
        public_id: uploadedImg.public_id
      };

      // Delete temp file
      req.file && deleteTempFiles([req.file]);
    }

    // Update the book
    const updatedBook = await Book.findByIdAndUpdate(bookId, updatedData, { new: true });

    res.status(200).json({ success: true, data: updatedBook });
  } catch (error) {
    console.error("Error in update book: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
