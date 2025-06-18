import { Account } from '../../models/account.model.js';
import { format } from 'date-fns';
import { VipSubscription } from "../../models/vipSubscription.model.js"
import bcrypt from 'bcryptjs';

// [GET] /api/admin/users/summary - Tổng hợp số lượng user và staff
export const getUserSummary = async (req, res) => {
  try {
    const [totalReaders, totalStaffs] = await Promise.all([
      Account.countDocuments({ role: { $in: ['user', 'VIP reader', 'reader'] } }),
      Account.countDocuments({ role: { $in: ['admin', 'staff'] } })
    ]);

    //get all vip subscriptions
    const totalVipsub = await VipSubscription.find({});

    // Calculate total income from all VIP subscriptions price
    const totalIncome = totalVipsub.reduce((acc, sub) => {
      return acc + (sub.price || 0);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        totalReaders,
        totalStaffs,
        totalIncome
      }
    });
  } catch (error) {
    console.error('Error in getUserSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// [GET] /api/admin/users/monthly-stats?year=2025 - Thống kê user mới theo từng tháng của năm cụ thể
export const getMonthlyUserStats = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year || !/^\d{4}$/.test(year)) {
      return res.status(400).json({
        success: false,
        message: 'Năm không hợp lệ (YYYY)'
      });
    }

    const stats = await Account.aggregate([
      {
        // Lọc dữ liệu - Chọn ra các tài khoản
        // + Được tạo trong năm được chọn (từ 1/1 đến trước 1/1 năm sau)
        // + Có role là một trong: 'user', 'VIP reader' hoặc 'reader'
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lt: new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`)
          },
          role: { $in: ['user', 'VIP reader', 'reader'] }
        }
      },
      // nhóm theo cùng tháng và đếm số lượng của mỗi tháng 
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      // định dạng lại kết quả đổi _id thành month, vd: { "month": 1, "count": 150 },
      {
        $project: {
          month: "$_id",
          count: 1,
          _id: 0
        }
      },
      { $sort: { month: 1 } }
    ]);

    // Điền đủ 12 tháng
    const fullStats = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      count: stats.find(s => s.month === i + 1)?.count || 0
    }));

    res.status(200).json({
      success: true,
      data: fullStats
    });
  } catch (error) {
    console.error('Error in getMonthlyUserStats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// [GET] /api/admin/users/daily-stats?year=2023&month=12 - Thống kê user mới theo ngày
export const getDailyUserStats = async (req, res) => {
  try {
    const { year, month } = req.query;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Năm hoặc tháng không hợp lệ'
      });
    }

    // Tính số ngày trong tháng 
    const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1));
    const endDate = new Date(Date.UTC(yearNum, monthNum, 0, 23, 59, 59, 999));
    const daysInMonth = endDate.getUTCDate();

    const stats = await Account.aggregate([
      {
        // Lọc các tài khoản trong tháng được chọn 
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          },
          role: { $in: ['user', 'VIP reader', 'reader'] }
        }
      },
      {
        // nhóm theo ngày và đếm số lượng 
        $group: {
          _id: { $dayOfMonth: { date: "$createdAt", timezone: "UTC" } }, // Xử lý timezone
          count: { $sum: 1 }
        }
      },
      {
        // định dạng lại kết quả 
        $project: {
          day: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    // Điền đủ các ngày trong tháng
    const fullStats = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      count: stats.find(s => s.day === i + 1)?.count || 0
    }));

    res.status(200).json({
      success: true,
      data: fullStats
    });
  } catch (error) {
    console.error('Error in getDailyUserStats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// [GET] /api/admin/accounts - Lấy danh sách tài khoản 
// GET /api/admin/accounts?search=ttmq&accountType=user&page=1&limit=5
export const getAccounts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      accountType = '', // 'user' hoặc 'staff'
      sortField = 'createdAt',
      sortOrder = 'desc' // 'asc' hoặc 'desc'
    } = req.query;

    const query = {};

    // Tìm kiếm
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    // Lọc theo loại tài khoản
    if (accountType === 'staff') {
      query.role = { $in: ['staff', 'admin'] };
    } else if (accountType === 'user') {
      query.role = { $in: ['reader', 'VIP reader'] };
    }

    // Lọc role cụ thể (ưu tiên hơn accountType)
    if (role) {
      query.role = role;
    }

    // Phân trang
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (currentPage - 1) * itemsPerPage;

    // Sắp xếp
    const sortOption = {};
    sortOption[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Truy vấn
    const [accounts, total] = await Promise.all([
      Account.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(itemsPerPage)
        .select('username name email phone role avatar createdAt'),

      Account.countDocuments(query)
    ]);

    // Format response
    const formattedData = accounts.map(account => ({
      id: account._id,
      username: account.username,
      name: account.name || account.username,
      email: account.email,
      phone: account.phone || null,
      role: account.role,
      avatar: account.avatar?.url || null,
      createdAt: format(account.createdAt, 'HH:mm dd/MM/yyyy'),
    }));

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        total,
        currentPage,
        itemsPerPage,
        totalPages: Math.ceil(total / itemsPerPage)
      }
    });

  } catch (error) {
    console.error('[ADMIN] Error fetching accounts:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    //get user and check if it exist
    const userID = req.params.userId;
    const account = await Account.findById(userID);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error('[ADMIN] Error get user details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

export const createStaff = async (req, res) => {
  try {
    const { username, name, email, phone, password, gender, avatar } = req.body;
    // check if account exists
    const accountExists = await Account.findOne({ email });
    if (accountExists) {
      return res.status(400).json({ success: false, message: 'Account already exists' });
    }

    //create new account
    const account = await Account.create({
      username,
      email,
      password,
      role: 'staff'
    })

    if (!account) {
      return res.status(400).json({ success: false, message: 'Invalid account data' });
    }

    res.status(201).json({ success: true, data: account });
  } catch (error) {
    console.error('[ADMIN] Error create staff account:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

export const getStaffDetails = async (req, res) => {
  try {
    //get user and check if it exist
    const staffID = req.params.staffId;
    const account = await Account.findById(staffID);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error('[ADMIN] Error get staff details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

export const deleteStaff = async (req, res) => {
  try {
    const staffID = req.params.staffId;
    const account = await Account.findById(staffID);

    if (!account) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    await Account.findByIdAndDelete(staffID);
    res.status(200).json({ success: true, message: "Staff is deleted" });
  } catch (error) {
    console.error('[ADMIN] Error delete staff', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

