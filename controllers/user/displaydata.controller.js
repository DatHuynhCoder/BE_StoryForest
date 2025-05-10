import { Account } from "../../models/account.model.js";

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