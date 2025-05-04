import express from 'express';
import {
  getUserSummary,
  getMonthlyUserStats,
  getDailyUserStats,
  getAccounts
} from '../../controllers/admin/admin.controller.js';

const adminRouter = express.Router();

//Tổng user và staff
adminRouter.get('/users/summary', getUserSummary);

//User mới hàng tháng
adminRouter.get('/users/monthly-stats', getMonthlyUserStats);

// User mới hàng ngày
adminRouter.get('/users/daily-stats', getDailyUserStats);

//Bảng người dùng, nhân viên
adminRouter.get('/accounts', getAccounts);

/*
// Chi tiết người dùng
adminRouter.get('/users/:userId', getUserDetails);

// Thêm nhân viên
adminRouter.post('/staffs', createStaff);

// Chi tiết nhân viên
adminRouter.get('/staffs/:staffId', getStaffDetails);

// Xóa nhân viên
adminRouter.delete('/staffs/:staffId', deleteStaff);
*/
export default adminRouter;