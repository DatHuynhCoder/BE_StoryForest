import { VipSubscription } from "../../models/vipSubscription.model.js";

export const getAllVIPReaders = async (req, res) => {
  try {
    //Get all VIP users and populate vipSubscription field
    const vipReaders = await VipSubscription.find({})
      .populate('userid')
      .sort({ endDate: -1 });

    res.status(200).json({success: true, data: vipReaders})
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" })
  }
}
