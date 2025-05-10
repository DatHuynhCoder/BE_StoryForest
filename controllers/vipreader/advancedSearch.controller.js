// Import thư viện xử lý embedding
import { pipeline } from "@xenova/transformers";

// Kết nối MongoDB và các module cần thiết
import mongoose from "mongoose";
import { Book } from "../../models/book.model.js";
import cosineSimilarity from "../../utils/cosineSimilarity.js";
import init from "../../utils/seedVectorsFromFile.js"; // Đọc embedding từ file (hoặc tạo mới nếu chưa có)

// Hàm xử lý tìm kiếm nâng cao
export const AdvancedSearch = async (req, res) => {
  try {
    // Khởi tạo và đọc vectors từ file (hoặc tạo mới nếu chưa tồn tại)
    let vectors = await init();

    // Lấy câu hỏi người dùng gửi lên từ body
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Missing question." });
    }

    // Tạo embedding cho câu hỏi bằng model pre-trained
    const embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    const output = await embedder(question, {
      pooling: "mean",     // Lấy trung bình các vector
      normalize: true,     // Chuẩn hóa vector đầu ra
    });
    const questionEmbedding = output.data;

    const results = [];

    // Tính cosine similarity giữa câu hỏi và mỗi văn bản đã có embedding
    for (let doc of vectors) {
      const score = cosineSimilarity(questionEmbedding, doc.embedding);

      results.push({
        matched_id: doc.id,
        matched_title: doc.title,
        similarity: score,
      });
    }

    // Sắp xếp kết quả theo độ tương đồng giảm dần
    results.sort((a, b) => {
      if (b.similarity !== a.similarity) {
        return b.similarity - a.similarity;
      } else {
        // Nếu cần sắp theo tiêu chí phụ thì thêm vào đây (chưa có common_count nên phần này vô tác dụng hiện tại)
        return b.common_count - a.common_count;
      }
    });

    // Giới hạn kết quả trả về (tối đa 20 kết quả)
    const topResults = results.slice(0, 20);

    if (topResults.length > 0) {
      // Lấy danh sách ID khớp
      const matchedIds = topResults.map((r) => r.matched_id);

      console.log(matchedIds); // Debug ID

      // Chuyển sang dạng ObjectId để truy vấn MongoDB
      const objectIds = matchedIds.map((id) => new mongoose.Types.ObjectId(id));

      // Truy vấn lấy dữ liệu sách từ MongoDB
      const response = await Book.find({
        _id: { $in: objectIds },
      });

      console.log(response); // Debug kết quả

      // Trả về danh sách sách phù hợp
      res.json(response);
    } else {
      // Không tìm thấy kết quả phù hợp
      res.json({ message: "No match found." });
    }

    console.log("advanced search"); // Log hoàn tất xử lý
  } catch (error) {
    console.error("Error in advanced search: ", error.message);

    // Trả về lỗi 500 nếu có sự cố
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
