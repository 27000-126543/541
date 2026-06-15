const { Promotion, Medicine, Order } = require('../models');
const { success, error, paginate, asyncHandler } = require('../middlewares/response');
const config = require('../config');
const dayjs = require('dayjs');

exports.getPromotionList = asyncHandler(async (req, res) => {
  const { type, status, page = 1, pageSize = 20 } = req.query;
  
  const query = { status: 'active' };
  if (type) {
    query.type = type;
  }
  
  const now = new Date();
  query.startTime = { $lte: now };
  query.endTime = { $gte: now };
  
  const skip = (page - 1) * pageSize;
  
  const [promotions, total] = await Promise.all([
    Promotion.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(pageSize)),
    Promotion.countDocuments(query)
  ]);
  
  paginate(res, promotions, total, Number(page), Number(pageSize));
});

exports.getPromotionDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const promotion = await Promotion.findById(id);
  if (!promotion) {
    return error(res, '活动不存在');
  }
  
  success(res, promotion);
});

exports.getFlashSaleList = asyncHandler(async (req, res) => {
  const now = new Date();
  
  const flashSales = await Promotion.find({
    type: 'flash_sale',
    status: 'active',
    startTime: { $lte: now },
    endTime: { $gte: now }
  }).populate('applicableMedicines');
  
  success(res, flashSales);
});

exports.getGroupBuyList = asyncHandler(async (req, res) => {
  const now = new Date();
  
  const groupBuys = await Promotion.find({
    type: 'group_buy',
    status: 'active',
    startTime: { $lte: now },
    endTime: { $gte: now }
  }).populate('applicableMedicines');
  
  success(res, groupBuys);
});

exports.calculateBestDiscount = asyncHandler(async (req, res) => {
  const { items, totalAmount, storeId } = req.body;
  
  const now = new Date();
  const promotions = await Promotion.find({
    status: 'active',
    startTime: { $lte: now },
    endTime: { $gte: now }
  });
  
  const availablePromotions = promotions.filter(promo => {
    if (promo.applicableCategories?.length > 0) {
      return true;
    }
    if (promo.applicableMedicines?.length > 0) {
      const medicineIds = items.map(i => i.medicineId);
      return promo.applicableMedicines.some(id => 
        medicineIds.includes(id.toString())
      );
    }
    return true;
  });
  
  const discountResults = availablePromotions.map(promo => {
    const discount = calculatePromotionDiscount(promo, totalAmount);
    return {
      promotionId: promo._id,
      name: promo.name,
      type: promo.type,
      discountAmount: discount,
      description: getPromotionDescription(promo)
    };
  }).filter(p => p.discountAmount > 0);
  
  discountResults.sort((a, b) => b.discountAmount - a.discountAmount);
  
  success(res, {
    bestOption: discountResults[0] || null,
    allOptions: discountResults
  });
});

exports.createPromotion = asyncHandler(async (req, res) => {
  const promotionData = req.body;
  
  const promotion = await Promotion.create({
    ...promotionData,
    createdBy: req.admin.realName
  });
  
  success(res, promotion, '创建成功');
});

exports.updatePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const promotion = await Promotion.findByIdAndUpdate(id, updateData, { new: true });
  if (!promotion) {
    return error(res, '活动不存在');
  }
  
  success(res, promotion, '更新成功');
});

exports.deletePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await Promotion.findByIdAndDelete(id);
  
  success(res, null, '删除成功');
});

function calculatePromotionDiscount(promotion, amount) {
  if (promotion.minOrderAmount && amount < promotion.minOrderAmount) {
    return 0;
  }
  
  switch (promotion.type) {
    case 'full_reduction':
      const tiers = promotion.rules.fullReduction?.tiers || [];
      tiers.sort((a, b) => b.threshold - a.threshold);
      for (const tier of tiers) {
        if (amount >= tier.threshold) {
          return tier.discount;
        }
      }
      return 0;
      
    case 'discount':
      const rate = promotion.rules.discount?.discountRate || 1;
      return amount * (1 - rate);
      
    case 'flash_sale':
      const flashRate = promotion.rules.flashSale?.discountRate || 1;
      return amount * (1 - flashRate);
      
    default:
      return 0;
  }
}

function getPromotionDescription(promotion) {
  switch (promotion.type) {
    case 'full_reduction':
      const tiers = promotion.rules.fullReduction?.tiers || [];
      return tiers.map(t => `满${t.threshold}减${t.discount}`).join('，');
    case 'discount':
      return `${(promotion.rules.discount?.discountRate * 10).toFixed(1)}折优惠`;
    case 'flash_sale':
      return `限时秒杀 ${(promotion.rules.flashSale?.discountRate * 10).toFixed(1)}折`;
    case 'group_buy':
      return `${promotion.rules.groupBuy?.groupSize}人拼团优惠`;
    default:
      return promotion.description || '';
  }
}
