import { Account } from "../../models/account.model.js";
import cloudinary from "../../config/cloudinary.js";
import jwt from 'jsonwebtoken';
import { OAuth2Client } from "google-auth-library";
import * as streamifier from 'streamifier';
//delete temp files import
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";

export const refreshToken = async (req, res) => {
	const refreshToken = req.cookies.refreshToken;

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
			return res.status(201).json({ success: true, data: account });
		} else {
			return res.status(400).json({ success: false, message: 'Invalid account data' });
		}
	} catch (error) {
		console.error("Error in create account: ", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
	}
}

export const loginAccount = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find account by email
		const account = await Account.findOne({ email });

		if (!account || !(await account.matchPassword(password))) {
			return res.status(401).json({ success: false, message: 'Invalid email or password' });
		}

		// Generate tokens
		const accessToken = jwt.sign(
			{ id: account._id, role: account.role },
			process.env.JWT_SECRET,
			{ expiresIn: '15m' }
		);

		const refreshToken = jwt.sign(
			{ id: account._id, role: account.role },
			process.env.JWT_REFRESH_SECRET,
			{ expiresIn: '7d' }
		);

		// Store refresh token in an HTTP-only cookie
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true, // Change to true in production
			sameSite: "Strict",
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
		});

		return res.status(200).json({ success: true, data: account, accessToken });
	} catch (error) {
		console.error("Error in login:", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
	}
};

const client_id = process.env.GG_CLIENT_ID
const client = new OAuth2Client(client_id)

async function verifyToken(token) {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: client_id
	})
	const payload = ticket.getPayload()
	// xử lí payload, ví dụ: lưu thông tin người dùng vào database
	return payload
}

export const loginAccountWithGoogle = async (req, res) => {
	const { token } = req.body
	const payload = await verifyToken(token)
	const { email, name, sub } = payload

	const accountExists = await Account.findOne({ email });

	if (accountExists) {
		return res.status(201).json({ success: true, data: email, message: 'Account already exists' });
	}

	try {
		const account = await Account.create({
			username: name,
			name: name,
			email: email,
			phone: "",
			password: "******",
			gender: "Không tiện tiết lộ",
			avatar: "",
			role: "reader"
		})
		// const account = await newAccount.save();
		if (account) {
			return res.status(201).json({ success: true, data: email });
		} else {
			return res.status(400).json({ success: false, message: 'Invalid account data' });
		}
	} catch (error) {
		console.error("Error in create account: ", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
	}
}

export const logoutAccount = async (req, res) => {
	try {
		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: true,
			sameSite: "Strict"
		});
		res.status(200).json({ success: true, message: "Logged out successfully" });
	} catch (error) {
		console.error("Error in log out: ", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
	}
};

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
			const avatarCloudinary = await new Promise((resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(
					{
						folder: "StoryForest/Account",
						transformation: [
							{ width: 800, height: 800, crop: "limit" },
							{ quality: "auto" },
							{ fetch_format: "auto" }
						]
					},
					(error, result) => {
						if (error) reject(error);
						else resolve(result);
					}
				);

				streamifier.createReadStream(req.files.avatar[0].buffer).pipe(uploadStream);
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
			const bgCloudinary = await new Promise((resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(
					{
						folder: "StoryForest/Account/BG",
						transformation: [
							{ width: 1920, height: 1080, crop: "limit" },
							{ quality: "auto" },
							{ fetch_format: "auto" }
						]
					},
					(error, result) => {
						if (error) reject(error);
						else resolve(result);
					}
				);
				streamifier.createReadStream(req.files.bgImg[0].buffer).pipe(uploadStream)
			});

			// Add new background image info to updateData
			updateData.bgImg = {
				url: bgCloudinary.secure_url,
				public_id: bgCloudinary.public_id
			};
		}

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

//Update property about
export const updateAbout = async (req, res) => {
	try {
		//get account
		const accountId = req.user.id;
		const account = await Account.findById(accountId);

		//get about data
		const { about } = req.body;

		//check if account exist
		if (!account) {
			return res.status(404).json({ success: false, message: "Account not found" });
		}

		//check about exist
		if (!about) {
			return res.status(404).json({ success: false, message: "About account not found" });
		}

		//update new about
		account.about = about;

		//save the update data
		await account.save();

		res.status(200).json({ success: true, message: "Update new about successfully!", data: account })
	} catch (error) {
		console.error("Error in update about account: ", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
	}
}

//Change password
export const changePass = async (req, res) => {
	try {
		const userID = req.user.id;
		const account = await Account.findById(userID);
		//Check if account exist
		if (!account) {
			return res.status(404).json({ success: false, message: "account not found" });
		}

		//get pass and newpass
		const { password, newpassword } = req.body;

		//Check if password match account password
		const isMatch = await account.matchPassword(password);
		if (!isMatch) {
			return res.status(401).json({ success: false, message: "Password doesn't match" });
		}

		//Change to new password (account has hash function so we dont need to use it here)
		account.password = newpassword;

		//update account
		await account.save();

		res.status(200).json({ success: true, message: "Change password sucessfully!" });
	} catch (error) {
		console.error("Error in update about account: ", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
	}
}

export const upgradeVip = async (req, res) => {
	const userid = req.user.id;
	try {
		const account = await Account.findById(userid);

		// Check if account exists
		if (!account) {
			return res.status(404).json({ success: false, message: "Account not found" });
		}

		// Update role to 'VIP reader'
		account.role = "VIP reader";

		// Save the updated account
		await account.save();

		return res.status(200).json({ success: true, message: "Account upgraded to VIP reader successfully!", data: account });
	} catch (error) {
		console.error("Error in upgrading to VIP reader: ", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
	}
}