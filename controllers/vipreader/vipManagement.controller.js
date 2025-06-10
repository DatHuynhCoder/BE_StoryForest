import { VipSubscription } from "../../models/vipSubscription.model.js";

export const checkVIPisActive = async (req, res) => {
  try {
    const { userID } = req.params;

    //get vipSubscription
    const vipSubscription = await VipSubscription.findById(userID);

    //check if that user has VIP
    if (!vipSubscription) {
      return res.status(404).json({ success: true, status: false, message: "User is not VIP or do not sign in yet" })
    }

    //check if vip is active
    const currentDate = new Date();
    if (vipSubscription.isActive && vipSubscription.endDate > currentDate) {

      return res.status(200).json({ success: true, status: true, message: "User is VIP" })
    } else {
      return res.status(200).json({ success: true, status: false, message: "User is not VIP or VIP has expired" })
    }

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" })
  }
}

export const createVIPSubcriptions = async (req, res) => {
  try {
    const { userid, name, price, endDate, duration } = req.body;

    //create new VIP Subcription
    const newVIPSubcription = await VipSubscription.create({
      userid,
      name,
      price,
      endDate: new Date(endDate),
      duration
    });
    
    return res.status(201).json({ success: true, message: "VIP Subscription created successfully"});
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" })
  }
}