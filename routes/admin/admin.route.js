import express from 'express';
import {
  getUserSummary,
  getMonthlyUserStats,
  getDailyUserStats,
  getAccounts,
  getUserDetails,
  createStaff,
  getStaffDetails,
  deleteStaff
} from '../../controllers/admin/admin.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/checkRole.js';

const adminRouter = express.Router();

//Tổng user và staff
adminRouter.get('/users/summary', protect, checkRole('admin'), getUserSummary);

//User mới hàng tháng
adminRouter.get('/users/monthly-stats', protect, checkRole('admin'), getMonthlyUserStats);

// User mới hàng ngày
adminRouter.get('/users/daily-stats', protect, checkRole('admin'), getDailyUserStats);

//Bảng người dùng, nhân viên
adminRouter.get('/accounts', protect, checkRole('admin'), getAccounts);

// Chi tiết người dùng
adminRouter.get('/users/:userId', protect, checkRole('admin'), getUserDetails);

// Thêm nhân viên
adminRouter.post('/staffs', protect, checkRole('admin'), createStaff);

// Chi tiết nhân viên
adminRouter.get('/staffs/:staffId', protect, checkRole('admin'), getStaffDetails);

// Xóa nhân viên
adminRouter.delete('/staffs/:staffId', protect, checkRole('admin'), deleteStaff);

export default adminRouter;