import { Book } from "../models/book.model.js";
import fs from "fs";
import { pipeline } from "@xenova/transformers";

// Đường dẫn tới file lưu vector và file chứa tài liệu (danh sách sách)
const VECTOR_FILE = "./data/vectors.json";

async function init() {
  let vectors = [];

  // Lấy dữ liệu từ MongoDB, chỉ lấy các trường title, synopsis, _id
  const books = await Book.find({}, { title: 1, synopsis: 1, _id: 1 });

  // Nếu đã tồn tại file vectors => đọc từ file
  if (fs.existsSync(VECTOR_FILE)) {
    vectors = JSON.parse(fs.readFileSync(VECTOR_FILE));
    console.log("✅ Loaded vectors from file.");
  } else {
    // Nếu chưa có, bắt đầu tạo embeddings mới từ dữ liệu sách
    console.log("⚙️  Vectors not found. Generating embeddings...");

    // Ghi danh sách sách ra file documents.json (tùy chọn, có thể để debug)
    fs.writeFileSync("./data/documents.json", JSON.stringify(books, null, 2));

    // Đọc lại danh sách tài liệu từ file
    const documents = JSON.parse(fs.readFileSync("./data/documents.json"));

    // Khởi tạo pipeline của transformers để tạo embedding
    const embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    // Tạo vector cho từng tài liệu (synopsis)
    for (let doc of documents) {
      const output = await embedder(doc.synopsis, {
        pooling: "mean",      // lấy trung bình vector
        normalize: true       // chuẩn hóa vector
      });

      // Lưu vector cùng metadata
      vectors.push({
        id: doc._id,
        title: doc.title,
        content: doc.synopsis,
        embedding: output.data,
      });
    }

    // Lưu toàn bộ vectors xuống file
    fs.writeFileSync(VECTOR_FILE, JSON.stringify(vectors));
    console.log("✅ Embeddings generated and saved.");
  }

  return vectors; // Trả về mảng vectors
}

export default init;
