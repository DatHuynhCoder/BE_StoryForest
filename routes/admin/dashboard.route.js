import express from 'express'
import { getDailyIncomeStats, getMonthlyIncomeStats, totalIncome } from '../../controllers/admin/dashboard.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/checkRole.js';

const dashboardRouter = express.Router();
// Tổng doanh thu
dashboardRouter.get('/total-income', protect, checkRole('admin'), totalIncome)

// Doanh thu hàng tháng
dashboardRouter.get('/monthly-stats', protect, checkRole('admin'), getMonthlyIncomeStats)

// Doanh thu hang ngày
dashboardRouter.get('/daily-stats', protect, checkRole('admin'), getDailyIncomeStats)
export default dashboardRouter;