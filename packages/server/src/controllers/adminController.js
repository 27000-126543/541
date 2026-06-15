const { Admin } = require('../models');
const { generateAdminToken } = require('../middlewares/auth');
const { success, error, asyncHandler } = require('../middlewares/response');

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  const admin = await Admin.findOne({ username });
  if (!admin) {
    return error(res, '用户名或密码错误');
  }
  
  if (admin.status !== 'active') {
    return error(res, '账号已被禁用');
  }
  
  const isValid = await admin.comparePassword(password);
  if (!isValid) {
    return error(res, '用户名或密码错误');
  }
  
  admin.lastLoginTime = new Date();
  admin.lastLoginIp = req.ip;
  await admin.save();
  
  const token = generateAdminToken(admin._id);
  
  success(res, {
    token,
    user: {
      id: admin._id,
      username: admin.username,
      realName: admin.realName,
      avatar: admin.avatar,
      role: admin.role,
      storeId: admin.storeId,
      permissions: admin.permissions
    }
  }, '登录成功');
});

exports.getAdminInfo = asyncHandler(async (req, res) => {
  const admin = req.admin;
  
  success(res, {
    id: admin._id,
    username: admin.username,
    realName: admin.realName,
    avatar: admin.avatar,
    phone: admin.phone,
    email: admin.email,
    role: admin.role,
    storeId: admin.storeId,
    permissions: admin.permissions
  });
});

exports.updatePassword = asyncHandler(async (req, res) => {
  const admin = req.admin;
  const { oldPassword, newPassword } = req.body;
  
  const isValid = await admin.comparePassword(oldPassword);
  if (!isValid) {
    return error(res, '原密码错误');
  }
  
  admin.password = newPassword;
  await admin.save();
  
  success(res, null, '密码修改成功');
});

exports.getAdminList = asyncHandler(async (req, res) => {
  const { role, page = 1, pageSize = 20 } = req.query;
  
  const query = {};
  if (role) query.role = role;
  
  const skip = (page - 1) * pageSize;
  
  const [admins, total] = await Promise.all([
    Admin.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(pageSize)),
    Admin.countDocuments(query)
  ]);
  
  res.json({
    code: 0,
    message: 'success',
    data: {
      list: admins,
      total,
      page,
      pageSize
    }
  });
});

exports.createAdmin = asyncHandler(async (req, res) => {
  const { username, password, realName, role, phone, email, storeId, permissions } = req.body;
  
  const exists = await Admin.findOne({ username });
  if (exists) {
    return error(res, '用户名已存在');
  }
  
  const admin = await Admin.create({
    username,
    password,
    realName,
    role,
    phone,
    email,
    storeId,
    permissions
  });
  
  success(res, admin, '创建成功');
});

exports.updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  if (updateData.password) {
    delete updateData.password;
  }
  
  const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true });
  if (!admin) {
    return error(res, '管理员不存在');
  }
  
  success(res, admin, '更新成功');
});

exports.deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await Admin.findByIdAndDelete(id);
  
  success(res, null, '删除成功');
});
