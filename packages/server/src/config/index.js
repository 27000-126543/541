require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy_db',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'pharmacy_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  
  memberLevels: {
    normal: { name: '普通会员', minAmount: 0, discount: 1, freeConsultation: 0, priorityDelivery: false },
    silver: { name: '银卡会员', minAmount: 1000, discount: 0.95, freeConsultation: 2, priorityDelivery: false },
    gold: { name: '金卡会员', minAmount: 5000, discount: 0.9, freeConsultation: 5, priorityDelivery: true },
    diamond: { name: '钻石会员', minAmount: 20000, discount: 0.85, freeConsultation: 999, priorityDelivery: true }
  },
  
  prescriptionStatus: {
    PENDING: 'pending',
    REVIEWING: 'reviewing',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    EXPIRED: 'expired'
  },
  
  orderStatus: {
    PENDING_PAYMENT: 'pending_payment',
    PAID: 'paid',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    PICKED_UP: 'picked_up',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  },
  
  consultationStatus: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  }
};
