import request from '../utils/request';

export const createOrder = (data) => {
  return request({
    url: '/orders',
    method: 'POST',
    data
  });
};

export const getOrderList = (params) => {
  return request({
    url: '/orders',
    method: 'GET',
    data: params
  });
};

export const getOrderDetail = (id) => {
  return request({
    url: `/orders/${id}`,
    method: 'GET'
  });
};

export const payOrder = (id, data = {}) => {
  return request({
    url: `/orders/${id}/pay`,
    method: 'POST',
    data
  });
};

export const cancelOrder = (id, data = {}) => {
  return request({
    url: `/orders/${id}/cancel`,
    method: 'POST',
    data
  });
};

export const confirmReceive = (id) => {
  return request({
    url: `/orders/${id}/confirm`,
    method: 'POST'
  });
};
