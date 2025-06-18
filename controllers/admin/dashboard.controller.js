import { VipSubscription } from "../../models/vipSubscription.model.js"

export const totalIncome = async (req, res) => {
  try {
    //get all vip subscriptions
    const totalVipsub = await VipSubscription.find({});

    // Calculate total income from all VIP subscriptions price
    const totalIncome = totalVipsub.reduce((acc, sub) => {
      return acc + (sub.price || 0);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalSubscriptions: totalVipsub.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getMonthlyIncomeStats = async (req, res) => {
  try {
    const { year } = req.query;
    //check if year is valid
    if (!year || !/^\d{4}$/.test(year)) {
      return res.status(400).json({
        success: false,
        message: 'Năm không hợp lệ (YYYY)'
      });
    }

    // Get income each month through VipSubscription model
    const stats = await VipSubscription.aggregate([
      {
        $match: {
          startDate: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lt: new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDate' }, // Group by month
          totalIncome: { $sum: '$price' } // Sum the price for each month
        }
      },
      {
        $sort: { _id: 1 } // Sort by month ascending
      }
    ])

    // Generate full stats for each month
    const fullStats = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthStat = stats.find(stat => stat._id === month);
      return {
        month,
        totalIncome: monthStat ? monthStat.totalIncome : 0
      };
    })

    res.status(200).json({
      success: true,
      data: fullStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export const getDailyIncomeStats = async (req, res) => {
  try {
    const { year, month } = req.query;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    // Validate year and month
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

    const stats = await VipSubscription.aggregate([
      {
        $match: {
          startDate: {
            $gte: startDate,
            $lt: endDate
          }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$startDate' }, // Group by day of month
          totalIncome: { $sum: '$price' } // Sum the price for each day
        }
      },
      {
        $sort: { _id: 1 } // Sort by day ascending
      }
    ])

    // Generate full stats for each day in the month
    const fullStats = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayStat = stats.find(stat => stat._id === day);
      return {
        day,
        totalIncome: dayStat ? dayStat.totalIncome : 0
      };
    })

    res.status(200).json({
      success: true,
      data: fullStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}