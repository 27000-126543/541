const jwt = require('jsonwebtoken');
const config = require('../config');
const { User, Admin } = require('../models');

exports.authUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ code: 401, message: '请先登录' });
    }
    
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({ code: 401, message: '用户不存在或已被禁用' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
  }
};

exports.authAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ code: 401, message: '请先登录' });
    }
    
    const decoded = jwt.verify(token, config.jwtSecret);
    if (!decoded.adminId) {
      return res.status(401).json({ code: 401, message: '无效的管理员令牌' });
    }
    
    const admin = await Admin.findById(decoded.adminId);
    if (!admin || admin.status !== 'active') {
      return res.status(401).json({ code: 401, message: '管理员不存在或已被禁用' });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
  }
};

exports.requirePermission = (permission) => {
  return (req, res, next) => {
    if (req.admin.role === 'super_admin') {
      return next();
    }
    if (req.admin.permissions?.includes(permission)) {
      return next();
    }
    res.status(403).json({ code: 403, message: '没有权限执行此操作' });
  };
};

exports.generateUserToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

exports.generateAdminToken = (adminId) => {
  return jwt.sign({ adminId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};
