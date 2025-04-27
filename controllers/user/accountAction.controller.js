import { Account } from "../../models/account.model.js";
import { OTP } from "../../models/otp.model.js";
import bcrypt from "bcryptjs";
import sendMail from "../../utils/sendMail.js";

export const sendOTP = async (req, res) => {
  try {
    //Get email from req.body
    const { email } = req.body;

    //Check if account exist
    const accountCheck = await Account.findOne({ email: email });
    if (!accountCheck) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    //Generate OTP
    let otp = Math.floor(100000 + Math.random() * 900000).toString();

    //hash OTP for security purpose
    const salt = 10
    const hashOTP = await bcrypt.hash(otp, salt);

    //Create Otp document
    const Otp = new OTP({
      otp: hashOTP,
      email: email
    })

    //save Otp
    await Otp.save();

    //OTP HTML mail content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Your OTP <strong>OTP</strong>: <strong>${otp}</strong></p>

        <p>The OTP expires after <strong>15</strong> minutes</p>

        <p style="margin-top: 20px;">Best Regard,<br> Story Forest Team</p>
      </div>
    `;

    //Send email to user
    const emailContent = {
      to: email,
      subject: "Password reset OTP from Story Forest",
      text: htmlContent
    }

    //send email to user
    const sendMailStatus = await sendMail(emailContent.to, emailContent.subject, emailContent.text);

    //Check if you successfully sent OTP
    if(!sendMailStatus){
      return res.status(500).json({ success: false, message: "Cannot send email" });
    }

    res.status(200).json({success: true, message:"OTP sent successfully"});
  } catch (error) {
    console.error("Error in send OTP: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const verifyOTP = async (req, res) => {
  try {
    //get email and otp
    const {email, otp} = req.body;

    //Check if email and otp exist
    if(!email || !otp){
      return res.status(404).json({ success: false, message: "Require OTP and Email" });
    }

    //Find Otp by email (latest)
    const otpfind = await OTP.findOne({email: email}).sort({createdAt: -1});

    //Check if otp exist in database
    if(!otpfind) {
      return res.status(404).json({ success: false, message: "OTP not found" });
    }

    //Check if expire
    if (otpfind.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    //compare otp
    const isValid = await bcrypt.compare(otp, otpfind.otp);
    
    //Check if enter otp correct
    if (!isValid) {
      return res.status(404).json({ success: false, message: "Otp entered not correct!" });
    }

    res.status(200).json({ success: true, message: "OTP verify successfully" });
  } catch (error) {
    console.error("Error in verify OTP: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const changepassbyOTP = async (req, res) => {
  try {
    //Get otp and email
    const { email, otp, newpass } = req.body;

    //Check if email and otp exist
    if (!email || !otp) {
      return res.status(404).json({ success: false, message: "Require OTP and Email" });
    }

    //Find Otp by email (latest)
    const otpfind = await OTP.findOne({ email: email }).sort({ createdAt: -1 });

    //Check if otp exist in database
    if (!otpfind) {
      return res.status(404).json({ success: false, message: "OTP not found" });
    }

    //Check if expire
    if (otpfind.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    

    //compare otp
    const isValid = await bcrypt.compare(otp, otpfind.otp);

    //Check if enter otp correct
    if (!isValid) {
      return res.status(404).json({ success: false, message: "Otp not correct!" });
    }

    //Check if pass exist
    if (!newpass) {
      return res.status(404).json({ success: false, message: "Require new password" });
    }

    //get the account to update
    const account = await Account.findOne({ email: email });

    //Check if account exist
    if (!account) {
      return res.status(404).json({ success: false, message: "account not found" });
    }

    //change pass
    account.password = newpass;

    //update account
    await account.save();

    res.status(200).json({ success: true, message: "Account updated sucessfully!" });
  } catch (error) {
    console.error("Error in change pass by OTP: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}