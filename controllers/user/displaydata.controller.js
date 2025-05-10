import { Account } from "../../models/account.model.js";
import { Favorite } from "../../models/favorite.model.js";

export const accountInfo = async (req, res) => {
  try {
    //Get userdata
    const accountID = req.params.id;
    const account = await Account.findById(accountID).select("-password");

    //Check if account exist
    if(!account){
      return res.status(400).json({success: false, message:"The User doesn't exist"});
    }

    res.status(200).json({success: true, data: account});
  } catch (error) {
    console.log('Error while getting chapters: ', err.message)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

export const getAnyFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ userId: req.params.id }).populate('bookIds');

    if (!favorite) {
      return res.status(404).json({ success: false, message: "No favorites found" });
    }

    res.status(200).json({ success: true, data: favorite.bookIds });
  } catch (error) {
    console.error("Get favorite error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}