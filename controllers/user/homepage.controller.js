import { Account } from "../../models/account.model.js";
import { Book } from "../../models/book.model.js";

export const getHomepage = async (req, res) => {
  try {
    //Get 15 manga has latest upload (sort by updateAt)
    const latestManga = await Book.find({ type: 'manga' })
      .sort({ updatedAt: -1 })
      .limit(15)
      .select('_id bookImg title type views rate synopsis')

    //check if 15 manga exist
    if (!latestManga) {
      return res.status(400).json({ success: false, message: "Cannot find latest manga data" });
    }

    //Get 15 novel has latest upload (sort by updateAt)
    const latestNovel = await Book.find({ type: 'novel' })
      .sort({ updateAt: -1 })
      .limit(15)
      .select('_id bookImg title type views rate synopsis')

    //Check if 15 novel exist
    if (!latestNovel) {
      return res.status(400).json({ success: false, message: "Cannot find latest novel data" });
    }

    //Get 15 trending book (sort by views)
    const trendBooks = await Book.find({})
      .sort({ views: -1 })
      .limit(15)
      .select('_id bookImg title type views rate synopsis')

    //Check if 15 trendBook exist
    if (!trendBooks) {
      return res.status(400).json({ success: false, message: "Cannot find trending books data" });
    }

    //Get 15 complete book (sort by view)
    const completeBooks = await Book.find({ status: 'completed' })
      .sort({ views: -1 })
      .limit(15)
      .select('_id bookImg title type views rate synopsis')

    //Check if 15 book completed exist
    if (!completeBooks) {
      return res.status(400).json({ success: false, message: "Cannot find complete books data" });
    }

    //get top 5 account base on exp
    const top5account = await Account.find({})
      .sort({exp: -1})
      .limit(5)
      .select('_id username avatar exp level rank')
    
    //check if top5account exist
    if(!top5account){
      return res.status(400).json({ success: false, message: "Cannot find top 5 account ranking" });
    }

    res.status(200).json({
      success: true,
      latestManga: latestManga,
      latestNovel: latestNovel,
      trendBooks: trendBooks,
      completeBooks: completeBooks,
      top5account: top5account
    })

  } catch (error) {
    console.error("Error in create author: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}