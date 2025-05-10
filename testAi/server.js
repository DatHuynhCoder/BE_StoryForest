const express = require('express');
const fs = require('fs');
const { pipeline } = require('@xenova/transformers');

// Config
const VECTOR_FILE = './data/vectors.json';
const DOCUMENT_FILE = './data/documents.json';
const PORT = 3000;

const app = express();
app.use(express.json());

let vectors = []; // { id, content, embedding }

// Hàm load hoặc tạo embeddings
async function init() {
    if (fs.existsSync(VECTOR_FILE)) {
        vectors = JSON.parse(fs.readFileSync(VECTOR_FILE));
        console.log('✅ Loaded vectors from file.');
    } else {
        console.log('⚙️  Vectors not found. Generating embeddings...');
        const documents = JSON.parse(fs.readFileSync(DOCUMENT_FILE));

        const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

        for (let doc of documents) {
            const output = await embedder(doc.synopsis, { pooling: 'mean', normalize: true });
            vectors.push({
                id: doc._id,
                title: doc.title,
                content: doc.synopsis,
                embedding: output.data
            });
        }
        fs.writeFileSync(VECTOR_FILE, JSON.stringify(vectors));
        console.log('✅ Embeddings generated and saved.');
    }
}

// Hàm tính cosine similarity
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Hàm tìm từ khóa chung (cải thiện thêm)


// API nhận câu hỏi, tìm document phù hợp nhất
app.post('/ask', async (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Missing question.' });
    }

    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await embedder(question, { pooling: 'mean', normalize: true });
    const questionEmbedding = output.data;

    const results = [];

    for (let doc of vectors) {
        const score = cosineSimilarity(questionEmbedding, doc.embedding);

      


        results.push({
            matched_id: doc.id,
            matched_title: doc.title,
            matched_content: doc.content,
            similarity: score,
        });
    }

    // Sắp xếp: Ưu tiên similarity cao + nhiều từ khóa chung
    results.sort((a, b) => {
        if (b.similarity !== a.similarity) {
            return b.similarity - a.similarity;
        } else {
            return b.common_count - a.common_count;
        }
    });

    // Chỉ trả về top N kết quả nếu muốn (ví dụ 5 kết quả)
    const topResults = results.slice(0,10)

    if (topResults.length > 0) {
        res.json(topResults);
    } else {
        res.json({ message: 'No match found.' });
    }
});

// Start server
init().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
});
