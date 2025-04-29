import { Account } from "../../models/account.model.js";
import { changeExp, checkLevelChange } from "../../utils/levelSystem.js";
import { daysBetweenDates } from "../../utils/dayBetweenDates.js";

export const dailycheckinPoints = async (req, res) => {
  try {
    const userID = req.user.id;

    //Get user
    const user = await Account.findById(userID)
      .select("exp level rank streak lastcheckin");

    //check if user exist
    if (!user) {
      res.status(404).json({ success: false, message: "Can't find Account" });
    }

    //get today time
    const today = new Date();

    //caculate day between 2 days
    const dayBetweenDates = daysBetweenDates(today, user.lastcheckin);

    //check time between check in now and last time check in
    if (dayBetweenDates !== 1) {
      user.streak = 1;
    } else {
      user.streak = user.streak + 1;
    }

    //increase exp of user
    const newexp = changeExp('dailycheck', user.exp, req.user.role);
    user.exp = newexp;
    //check level change
    const { level, rank } = checkLevelChange(user.exp);
    user.level = level;
    user.rank = rank;

    //update last check in
    user.lastcheckin = today;

    //update account property
    await user.save();

    res.status(200).json({ success: true, user: user, message: "Check in sucessfully" })
  } catch (error) {
    console.error("Error in add check in point: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const checkDailyCheckIn = async (req, res) => {
  try {
    const userID = req.user.id;

    //get user
    const user = await Account.findById(userID)
      .select("streak lastcheckin");

    //check if user exist
    if (!user) {
      res.status(404).json({ success: false, message: "Can't find Account" });
    }

    //get today time
    const today = new Date();
    //status: checkin or not
    let status = true;

    //duration between now and last time check in
    const dayBetweenDates = daysBetweenDates(today, user.lastcheckin);

    //Check if user have check in today
    if(dayBetweenDates > 1){ //streak loss, user haven't check in yet
      user.streak = 0;
      status = false;
    } 
    else if (dayBetweenDates === 1){ //streak continue, user haven't check in yer
      status = false;
    }

    //update user property
    await user.save();

    res.status(200).json({success: true, status: status})
  } catch (error) {
    console.error("Error in checking daily check in ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}