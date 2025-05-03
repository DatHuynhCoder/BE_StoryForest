import express from 'express';
import {
  getUserSummary,
  getMonthlyUserStats,
  getDailyUserStats,
  getUsersList
} from '../controllers/admin.controller.js';

const router = express.Router();

//Tổng user và staff
router.get('/users/summary', getUserSummary);

//User mới hàng tháng
router.get('/users/monthly-stats', getMonthlyUserStats);

// User mới hàng ngày
router.get('/users/daily-stats', getDailyUserStats);

//Bảng người dùng, nhân viên
router.get('/accounts', getUsersList);

/*
// Chi tiết người dùng
router.get('/users/:userId', getUserDetails);

// Thêm nhân viên
router.post('/staffs', createStaff);

// Chi tiết nhân viên
router.get('/staffs/:staffId', getStaffDetails);

// Xóa nhân viên
router.delete('/staffs/:staffId', deleteStaff);
*/
export default adminRouter;