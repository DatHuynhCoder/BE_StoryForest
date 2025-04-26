import { Book } from "../../models/book.model.js";

export const getHomepage = async (req, res) => {
  try {
    //Get 15 manga has latest upload (sort by updateAt)
    const latestManga = await Book.find({ type: 'manga' })
      .sort({ updatedAt: -1 })
      .limit(15)
      .select('_id bookImg title type')

    //check if 15 manga exist
    if (!latestManga) {
      return res.status(400).json({ success: false, message: "Cannot find latest manga data" });
    }

    //Get 15 novel has latest upload (sort by updateAt)
    const latestNovel = await Book.find({ type: 'novel' })
      .sort({ updateAt: -1 })
      .limit(15)
      .select('_id bookImg title type')

    //Check if 15 novel exist
    if (!latestNovel) {
      return res.status(400).json({ success: false, message: "Cannot find latest novel data" });
    }

    //Get 15 trending book (sort by views)
    const trendBooks = await Book.find({})
      .sort({ views: -1 })
      .limit(15)
      .select('_id bookImg title type')

    //Check if 15 trendBook exist
    if (!trendBooks) {
      return res.status(400).json({ success: false, message: "Cannot find trending books data" });
    }

    //Get 15 complete book (sort by view)
    const completeBooks = await Book.find({ status: 'completed' })
      .sort({ views: -1 })
      .limit(15)
      .select('_id bookImg title type')

    //Check if 15 book completed exist
    if (!completeBooks) {
      return res.status(400).json({ success: false, message: "Cannot find complete books data" });
    }

    res.status(200).json({
      success: true,
      latestManga: latestManga,
      latestNovel: latestNovel,
      trendBooks: trendBooks,
      completeBooks: completeBooks
    })

  } catch (error) {
    console.error("Error in create author: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}