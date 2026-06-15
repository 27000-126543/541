const { User } = require('../models');
const { generateUserToken } = require('../middlewares/auth');
const { success, error, asyncHandler } = require('../middlewares/response');
const config = require('../config');

exports.register = asyncHandler(async (req, res) => {
  const { phone, password, nickname } = req.body;
  
  const exists = await User.findOne({ phone });
  if (exists) {
    return error(res, '手机号已注册');
  }
  
  const user = await User.create({
    phone,
    password,
    nickname: nickname || `用户${phone.slice(-4)}`
  });
  
  const token = generateUserToken(user._id);
  
  success(res, {
    token,
    user: {
      id: user._id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      memberLevel: user.memberLevel,
      memberLevelInfo: user.memberLevelInfo
    }
  }, '注册成功');
});

exports.login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  
  const user = await User.findOne({ phone });
  if (!user) {
    return error(res, '用户不存在');
  }
  
  if (user.status !== 'active') {
    return error(res, '账号已被禁用');
  }
  
  const isValid = await user.comparePassword(password);
  if (!isValid) {
    return error(res, '密码错误');
  }
  
  const token = generateUserToken(user._id);
  
  success(res, {
    token,
    user: {
      id: user._id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      memberLevel: user.memberLevel,
      memberLevelInfo: user.memberLevelInfo
    }
  }, '登录成功');
});

exports.getUserInfo = asyncHandler(async (req, res) => {
  const user = req.user;
  
  success(res, {
    id: user._id,
    phone: user.phone,
    nickname: user.nickname,
    avatar: user.avatar,
    gender: user.gender,
    birthday: user.birthday,
    realName: user.realName,
    isRealNameVerified: user.isRealNameVerified,
    memberLevel: user.memberLevel,
    memberLevelInfo: user.memberLevelInfo,
    memberPoints: user.memberPoints,
    yearlyConsumption: user.yearlyConsumption,
    freeConsultationCount: user.freeConsultationCount,
    healthProfile: user.healthProfile,
    medicalInsurance: {
      isBound: user.medicalInsurance.isBound,
      insuredCity: user.medicalInsurance.insuredCity
    },
    nextLevelInfo: calculateNextLevel(user.yearlyConsumption)
  });
});

exports.updateUserInfo = asyncHandler(async (req, res) => {
  const { nickname, avatar, gender, birthday } = req.body;
  const user = req.user;
  
  if (nickname !== undefined) user.nickname = nickname;
  if (avatar !== undefined) user.avatar = avatar;
  if (gender !== undefined) user.gender = gender;
  if (birthday !== undefined) user.birthday = birthday;
  
  await user.save();
  
  success(res, {
    id: user._id,
    nickname: user.nickname,
    avatar: user.avatar,
    gender: user.gender,
    birthday: user.birthday
  }, '更新成功');
});

exports.updateHealthProfile = asyncHandler(async (req, res) => {
  const { allergies, chronicDiseases, medicalHistory, bloodType } = req.body;
  const user = req.user;
  
  if (allergies) user.healthProfile.allergies = allergies;
  if (chronicDiseases) user.healthProfile.chronicDiseases = chronicDiseases;
  if (medicalHistory) user.healthProfile.medicalHistory = medicalHistory;
  if (bloodType) user.healthProfile.bloodType = bloodType;
  
  await user.save();
  
  success(res, user.healthProfile, '健康档案更新成功');
});

exports.addFamilyMember = asyncHandler(async (req, res) => {
  const user = req.user;
  const member = req.body;
  
  user.familyMembers.push(member);
  await user.save();
  
  success(res, user.familyMembers[user.familyMembers.length - 1], '添加成功');
});

exports.updateFamilyMember = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const updateData = req.body;
  
  const member = user.familyMembers.id(id);
  if (!member) {
    return error(res, '家庭成员不存在');
  }
  
  Object.assign(member, updateData);
  await user.save();
  
  success(res, member, '更新成功');
});

exports.deleteFamilyMember = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  
  user.familyMembers.pull(id);
  await user.save();
  
  success(res, null, '删除成功');
});

exports.getFamilyMembers = asyncHandler(async (req, res) => {
  success(res, req.user.familyMembers);
});

exports.addAddress = asyncHandler(async (req, res) => {
  const user = req.user;
  const address = req.body;
  
  if (address.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }
  
  if (user.addresses.length === 0) {
    address.isDefault = true;
  }
  
  user.addresses.push(address);
  await user.save();
  
  success(res, user.addresses[user.addresses.length - 1], '添加成功');
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const updateData = req.body;
  
  const address = user.addresses.id(id);
  if (!address) {
    return error(res, '地址不存在');
  }
  
  if (updateData.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }
  
  Object.assign(address, updateData);
  await user.save();
  
  success(res, address, '更新成功');
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  
  user.addresses.pull(id);
  await user.save();
  
  success(res, null, '删除成功');
});

exports.getAddresses = asyncHandler(async (req, res) => {
  success(res, req.user.addresses);
});

function calculateNextLevel(yearlyConsumption) {
  const levels = config.memberLevels;
  const levelList = Object.entries(levels).sort((a, b) => b[1].minAmount - a[1].minAmount);
  
  for (const [level, info] of levelList) {
    if (yearlyConsumption >= info.minAmount) {
      const currentIndex = levelList.findIndex(l => l[0] === level);
      if (currentIndex > 0) {
        const [nextLevel, nextInfo] = levelList[currentIndex - 1];
        return {
          currentLevel: level,
          nextLevel,
          nextLevelInfo: nextInfo,
          progress: Math.min(100, Math.round((yearlyConsumption / nextInfo.minAmount) * 100)),
          amountToNext: nextInfo.minAmount - yearlyConsumption
        };
      }
      return {
        currentLevel: level,
        nextLevel: null,
        progress: 100,
        amountToNext: 0
      };
    }
  }
  
  return {
    currentLevel: 'normal',
    nextLevel: 'silver',
    nextLevelInfo: levels.silver,
    progress: Math.round((yearlyConsumption / levels.silver.minAmount) * 100),
    amountToNext: levels.silver.minAmount - yearlyConsumption
  };
}
