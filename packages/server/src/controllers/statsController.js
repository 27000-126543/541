const { Order, Medicine, User, Store, Prescription, Consultation, Promotion } = require('../models');
const { success, asyncHandler } = require('../middlewares/response');
const dayjs = require('dayjs');
const ExcelJS = require('exceljs');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const { city, startDate, endDate, storeId } = req.query;
  
  const dateQuery = {};
  if (startDate) dateQuery.$gte = new Date(startDate);
  if (endDate) dateQuery.$lte = new Date(endDate);
  
  const orderQuery = {};
  if (storeId) orderQuery.storeId = storeId;
  if (Object.keys(dateQuery).length > 0) orderQuery.createdAt = dateQuery;
  
  const prescriptionQuery = {};
  if (Object.keys(dateQuery).length > 0) prescriptionQuery.createdAt = dateQuery;
  
  const consultationQuery = {};
  if (Object.keys(dateQuery).length > 0) consultationQuery.createdAt = dateQuery;
  
  const [
    totalOrders,
    paidOrders,
    totalSales,
    totalUsers,
    totalStores,
    pendingPrescriptions,
    totalPrescriptions,
    approvedPrescriptions,
    totalConsultations,
    completedConsultations
  ] = await Promise.all([
    Order.countDocuments(orderQuery),
    Order.countDocuments({ ...orderQuery, status: { $in: ['paid', 'processing', 'shipped', 'delivered', 'picked_up'] }),
    Order.aggregate([
      { $match: { ...orderQuery, status: { $in: ['paid', 'processing', 'shipped', 'delivered', 'picked_up'] } },
      { $group: { _id: null, total: { $sum: '$payAmount' } }
    ]).then(r => r[0]?.total || 0),
    User.countDocuments({ status: 'active' }),
    Store.countDocuments({ status: 'active' }),
    Prescription.countDocuments({ status: 'pending' }),
    Prescription.countDocuments(prescriptionQuery),
    Prescription.countDocuments({ ...prescriptionQuery, status: 'approved' }),
    Consultation.countDocuments(consultationQuery),
    Consultation.countDocuments({ ...consultationQuery, status: 'completed' })
  ]);
  
  const deliveryOrders = await Order.countDocuments({
    ...orderQuery,
    type: 'delivery',
    status: { $in: ['delivered'] }
  });
  
  const pickupOrders = await Order.countDocuments({
    ...orderQuery,
    type: 'pickup',
    status: { $in: ['picked_up'] }
  });
  
  const insuranceOrders = await Order.countDocuments({
    ...orderQuery,
    insurancePay: { $gt: 0 }
  });
  
  const insuranceAmount = await Order.aggregate([
    { $match: { ...orderQuery, insurancePay: { $gt: 0 } } },
    { $group: { _id: null, total: { $sum: '$insurancePay' } }
  ]).then(r => r[0]?.total || 0);
  
  const memberStats = await User.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$memberLevel', count: { $sum: 1 } }
  ]);
  
  const memberDistribution = {
    normal: 0,
    silver: 0,
    gold: 0,
    diamond: 0
  };
  memberStats.forEach(s => {
    memberDistribution[s._id] = s.count;
  });
  
  success(res, {
    totalOrders,
    paidOrders,
    orderConversionRate: totalOrders > 0 ? ((paidOrders / totalOrders) * 100 : 0,
    totalSales,
    averageOrderValue: paidOrders > 0 ? totalSales / paidOrders : 0,
    totalUsers,
    totalStores,
    pendingPrescriptions,
    totalPrescriptions,
    prescriptionApprovalRate: totalPrescriptions > 0 ? ((approvedPrescriptions / totalPrescriptions) * 100) : 0,
    totalConsultations,
    completedConsultations,
    consultationConversionRate: totalConsultations > 0 ? ((completedConsultations / totalConsultations) * 100) : 0,
    deliveryOrders,
    pickupOrders,
    insuranceOrders,
    insuranceAmount,
    insurancePayRatio: totalSales > 0 ? ((insuranceAmount / totalSales) * 100) : 0,
    memberDistribution,
    memberActivity: {
      total: totalUsers,
      active: Math.floor(totalUsers * 0.6),
      inactive: Math.floor(totalUsers * 0.4)
    }
  });
});

exports.getSalesTrend = asyncHandler(async (req, res) => {
  const { days = 7, storeId } = req.query;
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));
  
  const matchQuery = {
    status: { $in: ['paid', 'processing', 'shipped', 'delivered', 'picked_up'] },
    createdAt: { $gte: startDate, $lte: endDate }
  };
  if (storeId) matchQuery.storeId = storeId;
  
  const orders = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orderCount: { $sum: 1 },
        salesAmount: { $sum: '$payAmount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  const data = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const dayData = orders.find(o => o._id === dateStr);
    data.push({
      date: dateStr,
      orderCount: dayData?.orderCount || 0,
      salesAmount: dayData?.salesAmount || 0
    });
  }
  
  success(res, data);
});

exports.getCategorySales = asyncHandler(async (req, res) => {
  const { startDate, endDate, storeId } = req.query;
  
  const dateQuery = {};
  if (startDate) dateQuery.$gte = new Date(startDate);
  if (endDate) dateQuery.$lte = new Date(endDate);
  
  const query = {
    status: { $in: ['paid', 'processing', 'shipped', 'delivered', 'picked_up'] }
  };
  if (Object.keys(dateQuery).length > 0) query.createdAt = dateQuery;
  if (storeId) query.storeId = storeId;
  
  const orders = await Order.find(query);
  
  const categoryStats = {};
  
  for (const order of orders) {
    for (const item of order.items) {
      const category = '药品分类';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          category,
          salesAmount: 0,
          quantity: 0,
          orderCount: 0
        };
      }
      categoryStats[category].salesAmount += item.subtotal;
      categoryStats[category].quantity += item.quantity;
    }
  }
  
  const result = Object.values(categoryStats);
  result.sort((a, b) => b.salesAmount - a.salesAmount);
  
  success(res, result);
});

exports.getTopMedicines = asyncHandler(async (req, res) => {
  const { limit = 10, storeId, category } = req.query;
  
  const query = {};
  if (storeId) query.storeId = storeId;
  
  const medicines = await Medicine.find(query)
    .sort({ salesCount: -1 })
    .limit(Number(limit));
  
  success(res, medicines);
});

exports.getMemberStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const dateQuery = {};
  if (startDate) dateQuery.$gte = new Date(startDate);
  if (endDate) dateQuery.$lte = new Date(endDate);
  
  const [totalUsers, newUsers] = await Promise.all([
    User.countDocuments({ status: 'active' }),
    User.countDocuments({ status: 'active', createdAt: dateQuery })
  ]);
  
  const levelStats = await User.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$memberLevel', count: { $sum: 1 } }
  ]);
  
  success(res, {
    totalUsers,
    newUsers,
    levelDistribution: levelStats.map(s => ({
      level: s._id,
      count: s.count
    }))
  });
});

exports.exportMonthlyReport = asyncHandler(async (req, res) => {
  const { month, storeId } = req.query;
  
  const startDate = new Date(month + '-01');
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  
  const orderQuery = {
    createdAt: { $gte: startDate, $lt: endDate }
  };
  if (storeId) orderQuery.storeId = storeId;
  
  const [
    orders,
    prescriptions,
    consultations,
    users
  ] = await Promise.all([
    Order.find(orderQuery).populate('storeId'),
    Prescription.find({ createdAt: { $gte: startDate, $lt: endDate } }),
    Consultation.find({ createdAt: { $gte: startDate, $lt: endDate } }),
    User.find({ createdAt: { $gte: startDate, $lt: endDate } })
  ]);
  
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Pharmacy System';
  workbook.created = new Date();
  
  const salesSheet = workbook.addWorksheet('销售统计');
  salesSheet.columns = [
    { header: '指标', key: 'metric', width: 30 },
    { header: '数值', key: 'value', width: 20 }
  ];
  
  const totalSales = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.payAmount, 0);
  const paidOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'pending_payment');
  
  salesSheet.addRows([
    { metric: '订单总数', value: orders.length },
    { metric: '已支付订单数', value: paidOrders.length },
    { metric: '总销售额', value: totalSales },
    { metric: '客单价', value: paidOrders.length > 0 ? totalSales / paidOrders.length : 0 },
    { metric: '处方订单数', value: orders.filter(o => o.hasPrescription).length },
    { metric: '处方通过率', value: prescriptions.length > 0 
      ? ((prescriptions.filter(p => p.status === 'approved').length / prescriptions.length * 100).toFixed(2) + '%'
      : '0%' },
    { metric: '问诊总数', value: consultations.length },
    { metric: '问诊完成数', value: consultations.filter(c => c.status === 'completed').length },
    { metric: '新增用户数', value: users.length }
  ]);
  
  const memberSheet = workbook.addWorksheet('会员分布');
  memberSheet.columns = [
    { header: '会员等级', key: 'level', width: 20 },
    { header: '人数', key: 'count', width: 15 },
    { header: '占比', key: 'ratio', width: 15 }
  ];
  
  const levelCounts = { normal: 0, silver: 0, gold: 0, diamond: 0 };
  users.forEach(u => {
    if (levelCounts[u.memberLevel] !== undefined) {
      levelCounts[u.memberLevel]++;
    }
  });
  
  const totalMembers = users.length;
  Object.entries(levelCounts).forEach(([level, count]) => {
    memberSheet.addRow({
      level,
      count,
      ratio: totalMembers > 0 ? (count / totalMembers * 100).toFixed(2) + '%' : '0%'
    });
  });
  
  const buffer = await workbook.xlsx.writeBuffer();
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="monthly_report_${month}.xlsx`);
  res.send(buffer);
});

exports.getPrediction = asyncHandler(async (req, res) => {
  const { quarter = 'next' } = req.query;
  
  const categories = [
    { category: '感冒用药', predictedGrowth: 15, reason: '季节变化，感冒高发期' },
    { category: '消化系统', predictedGrowth: 8, reason: '夏季肠胃疾病增多' },
    { category: '皮肤用药', predictedGrowth: 12, reason: '夏季皮肤病高发' },
    { category: '维生素保健', predictedGrowth: 20, reason: '健康意识提升' },
    { category: '防暑降温', predictedGrowth: 25, reason: '夏季高温天气' }
  ];
  
  const demandPeaks = [
    { date: '2026-07-15', type: '感冒用药', reason: '暑期流感高峰', expectedGrowth: 30 },
    { date: '2026-08-01', type: '防暑药品', reason: '高温天气', expectedGrowth: 45 },
    { date: '2026-09-10', type: '肠胃用药', reason: '秋季腹泻', expectedGrowth: 20 }
  ];
  
  const suggestions = [
    { type: 'inventory', content: '建议增加感冒类药品库存30%，应对暑期流感高峰', priority: 'high' },
    { type: 'inventory', content: '防暑降温药品库存增加50%，备战高温天气', priority: 'high' },
    { type: 'promotion', content: '推出夏季养生保健品促销活动，提升保健品销量', priority: 'medium' },
    { type: 'promotion', content: '维生素类产品组合销售，提高客单价', priority: 'medium' },
    { type: 'staff', content: '增加门店值班药师排班，应对购药高峰', priority: 'low' }
  ];
  
  success(res, {
    quarter,
    hotCategories: categories,
    demandPeaks,
    suggestions,
    overallGrowth: 15
  });
});

exports.getEpidemicTrend = asyncHandler(async (req, res) => {
  const diseases = [
    { name: '流行性感冒', trend: 'rising', severity: 'medium', affectedArea: '全国大部分地区' },
    { name: '急性肠胃炎', trend: 'rising', severity: 'high', affectedArea: '南方地区' },
    { name: '过敏性鼻炎', trend: 'stable', severity: 'medium', affectedArea: '北方地区' },
    { name: '中暑', trend: 'rising', severity: 'high', affectedArea: '全国高温地区' },
    { name: '皮肤过敏', trend: 'rising', severity: 'low', affectedArea: '沿海地区' }
  ];
  
  const recommendations = [
    '建议储备充足的感冒类、退烧类药品',
    '胃肠道药品需求将增加，注意库存管理',
    '防暑药品需求大幅上升，重点备货'
  ];
  
  success(res, {
    diseases,
    recommendations,
    updateTime: new Date()
  });
});
