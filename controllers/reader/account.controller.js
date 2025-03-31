import { Account } from "../../models/account.model.js";
import cloudinary from "../../config/cloudinary.js";
import jwt from 'jsonwebtoken';
//delete temp files import
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";

export const refreshToken = async (req, res) => {
	const { refreshToken } = req.body;

	if (!refreshToken) {
		return res.status(401).json({ success: false, message: 'Refresh token required' });
	}

	try {
		// Verify refresh token
		const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

		// Find user by ID
		const account = await Account.findById(decoded.id);

		if (!account) {
			return res.status(403).json({ success: false, message: 'Invalid refresh token' });
		}

		// Generate new access token
		const accessToken = jwt.sign(
			{ id: account._id, role: account.role },
			process.env.JWT_SECRET,
			{ expiresIn: '15m' }
		);

		console.log("token refresh!")
		res.status(200).json({
			success: true,
			accessToken
		});
	} catch (error) {
		return res.status(403).json({ success: false, message: 'Invalid refresh token' });
	}
};

export const createAccount = async (req, res) => {
	const { username, name, email, phone, password, gender, avatar, role } = req.body;
	// check if account exists
	const accountExists = await Account.findOne({ email });
	if (accountExists) {
		return res.status(400).json({ success: false, message: 'Account already exists' });
	}
	try {
		const account = await Account.create({
			username,
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
			return res.status(201).json({ success: true, data: account});
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
		//generate access token
		const token = jwt.sign({ id: account._id, role: account.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
		//generate refresh token
		const refreshToken = jwt.sign({ id: account._id, role: account.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

		//maybe you should store refresh token
		return res.status(200).json({ success: true, data: account, token, refreshToken });
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
		const accountId = req.user.id;
		const account = await Account.findById(accountId);

		// Check if account not found
		if (!account) {
			return res.status(404).json({ success: false, message: "Account not found" });
		}

		let updateData = { ...req.body }; // Copy data from req.body

		// Upload account avatar to Cloudinary
		if (req.files?.avatar) {
			// Delete old avatar
			if (account.avatar && account.avatar.public_id) {
				await cloudinary.uploader.destroy(account.avatar.public_id);
			}

			// Upload new avatar
			const avatarCloudinary = await cloudinary.uploader.upload(req.files.avatar[0].path, {
				folder: "StoryForest/Account",
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
		}

		// Upload account background image to Cloudinary
		if (req.files?.bgImg) {
			// Delete old background image
			if (account.bgImg && account.bgImg.public_id) {
				await cloudinary.uploader.destroy(account.bgImg.public_id);
			}

			// Upload new background image
			const bgCloudinary = await cloudinary.uploader.upload(req.files.bgImg[0].path, {
				folder: "StoryForest/Account/BG",
				transformation: [
					{ width: 1920, height: 1080, crop: "limit" },
					{ quality: "auto" },
					{ fetch_format: "auto" }
				]
			});

			// Add new background image info to updateData
			updateData.bgImg = {
				url: bgCloudinary.secure_url,
				public_id: bgCloudinary.public_id
			};
		}

		// Delete temporary uploaded files and clean the uploads folder
		deleteTempFiles([req.files?.avatar?.[0], req.files?.bgImg?.[0]]);

		// Update account
		const updatedAccount = await Account.findByIdAndUpdate(accountId, updateData, { new: true, runValidators: true });

		res.status(200).json({ success: true, data: updatedAccount });
	} catch (error) {
		console.error("Error in update account: ", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
	}
}

export const getAccount = async (req, res) => {
	try {
		//get account id
		const accountId = req.user.id;
		const account = await Account.findById(accountId).select("-password"); //Get user info without password

		// Check if account not found
		if (!account) {
			return res.status(404).json({ success: false, message: "Account not found" });
		}
		res.status(200).json({ success: true, data: account })
	} catch (error) {
		console.error("Error in update account: ", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
	}
}