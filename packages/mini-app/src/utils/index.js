import dayjs from 'dayjs';

export const formatPrice = (price) => {
  if (price === undefined || price === null) return '0.00';
  return Number(price).toFixed(2);
};

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

export const formatTime = (date) => {
  if (!date) return '';
  return dayjs(date).format('HH:mm');
};

export const getStatusText = (status, type = 'order') => {
  const statusMap = {
    order: {
      pending_payment: '待支付',
      paid: '待发货',
      processing: '备货中',
      shipped: '配送中',
      delivered: '已完成',
      picked_up: '已取货',
      cancelled: '已取消',
      refunded: '已退款'
    },
    prescription: {
      pending: '待审核',
      reviewing: '审核中',
      approved: '已通过',
      rejected: '已拒绝',
      expired: '已过期'
    },
    consultation: {
      pending: '待接诊',
      in_progress: '进行中',
      completed: '已完成',
      cancelled: '已取消'
    }
  };
  
  return statusMap[type]?.[status] || status;
};

export const getOrderTypeText = (type) => {
  return type === 'delivery' ? '配送' : '自提';
};

export const getMemberLevelText = (level) => {
  const map = {
    normal: '普通会员',
    silver: '银卡会员',
    gold: '金卡会员',
    diamond: '钻石会员'
  };
  return map[level] || '普通会员';
};

export const getMemberLevelColor = (level) => {
  const map = {
    normal: '#999',
    silver: '#c0c0c0',
    gold: '#ffd700',
    diamond: '#00bfff'
  };
  return map[level] || '#999';
};

export const validatePhone = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone);
};

export const validateIdCard = (idCard) => {
  return /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard);
};

export const debounce = (fn, delay = 300) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

export const throttle = (fn, delay = 300) => {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
};

export const generateOrderNo = () => {
  const now = dayjs().format('YYYYMMDDHHmmss');
  const random = Math.random().toString().slice(2, 8);
  return `PH${now}${random}`;
};

export const formatDistance = (distance) => {
  if (!distance) return '';
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};
