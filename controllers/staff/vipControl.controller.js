import { VipSubscription } from "../../models/vipSubscription.model.js";
import { Account } from "../../models/account.model.js";
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

export const changeVIPStatus = async (req,res) => {
  try {
    const {userid} = req.params;

    //find the vip subscription by userid
    const vipSubscription = await VipSubscription.findOne({ userid});
    if (!vipSubscription) {
      return res.status(404).json({ success: false, message: "VIP subscription not found" });
    }

    //find user by userid
    const user = await Account.findById(userid);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    //Toggle VIP status
    if(vipSubscription.isActive){
      //If VIP is active, deactivate it
      vipSubscription.isActive = false;
      user.role = 'reader';
      await vipSubscription.save();
      await user.save();
    } else {
      //If VIP is inactive, activate it
      vipSubscription.isActive = true;
      user.role = 'VIP reader';
      await vipSubscription.save();
      await user.save();
    }
    
    return res.status(200).json({ success: true, message: "VIP status updated" });
  } catch (error) {
    console.error("Error in changeVIPStatus:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
