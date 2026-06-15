import request from '../utils/request';

export const getPromotionList = (params) => {
  return request({
    url: '/promotions',
    method: 'GET',
    data: params
  });
};

export const getPromotionDetail = (id) => {
  return request({
    url: `/promotions/${id}`,
    method: 'GET'
  });
};

export const getFlashSaleList = () => {
  return request({
    url: '/promotions/flash-sale/list',
    method: 'GET'
  });
};

export const getGroupBuyList = () => {
  return request({
    url: '/promotions/group-buy/list',
    method: 'GET'
  });
};

export const calculateBestDiscount = (data) => {
  return request({
    url: '/promotions/calculate-discount',
    method: 'POST',
    data
  });
};
