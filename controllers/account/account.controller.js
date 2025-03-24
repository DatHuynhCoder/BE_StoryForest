import { Account } from "../../models/account.model";
import cloudinary from "../../config/cloudinary.js";
//delete temp files import
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";

export const createAccount = async (req, res) => {
    const { name_account, name, email, phone, password, gender, avatar, role } = req.body;
    // check if account exists
    const accountExists = await Account.findOne({ email });
    if (accountExists) {
        return res.status(400).json({ success: false, message: 'Account already exists' });
    }
    try {
        const account = await Account.create({
            name_account,
            name,
            email,
            phone,
            password,
            gender,
            avatar,
            role
        })
        // const account = await newAccount.save();
        if (account) {
            // use _id to create token
            const token = jwt.sign({ id: account._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            return res.status(201).json({ success: true, data: account, token });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid account data' });
        }
    } catch (error) {
        console.error("Error in create account: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export const loginAccount = async (req, res) => {
    const { email, password } = req.body;

    const account = await Account.findOne({ email });

    if (account && (await account.matchPassword(password))) {
        const token = jwt.sign({ id: account._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        // localStorage.setItem('token', token); // use this line is in the frontend
        // const token = localStorage.getItem('token');
        return res.status(200).json({ success: true, data: account, token });
    } else {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
}

export const getAllAccount = async (req, res) => {
    try {
        const accounts = await Account.find({});
        return res.status(200).json({ success: true, data: accounts });
    } catch (error) {
        console.error("Error in get accounts: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export const deleteAccount = async (req, res) => {
    try {
        const accountId = req.params.id;
        const account = await Account.findById(accountId);

        if (!account) {
            return res.status(404).json({ success: false, message: "Account not found" });
        }

        await Account.findByIdAndDelete(accountId);
        res.status(200).json({ success: true, message: "Account is deleted" });
    } catch (error) {
        console.error("Error in delete account: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export const updateAccount = async (req, res) => {
    try {
        // Get account by id
        const accountId = req.params.id;
        const account = await Account.findById(accountId);

        // Check if account not found
        if (!account) {
            return res.status(404).json({ success: false, message: "Account not found" });
        }

        let updateData = { ...req.body }; // Copy data from req.body

        // Upload account avatar to cloudinary
        if (req.file) {
            // Delete old avatar
            await cloudinary.uploader.destroy(account.avatar.public_id);

            // Upload new avatar
            const avatarCloudinary = await cloudinary.uploader.upload(req.file.path, {
                folder: 'StoryForest/Account',
                transformation: [
                    { width: 800, height: 800, crop: "limit" },
                    { quality: "auto" },
                    { fetch_format: "auto" }
                ]
            });

            // Add new avatar info to updateData
            updateData.avatar = {
                url: avatarCloudinary.secure_url,
                public_id: avatarCloudinary.public_id
            };

            // Delete the temp file
            deleteTempFiles([req.file]);
        }

        // Update account
        const updatedAccount = await Account.findByIdAndUpdate(accountId, updateData, { new: true, runValidators: true });

        res.status(200).json({ success: true, data: updatedAccount });
    } catch (error) {
        console.error("Error in update account: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}