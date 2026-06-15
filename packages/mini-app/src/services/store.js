import request from '../utils/request';

export const getStoreList = (params) => {
  return request({
    url: '/stores',
    method: 'GET',
    data: params
  });
};

export const getStoreDetail = (id) => {
  return request({
    url: `/stores/${id}`,
    method: 'GET'
  });
};

export const getNearestStore = (params) => {
  return request({
    url: '/stores/nearest',
    method: 'GET',
    data: params
  });
};

export const getStoreMedicines = (storeId, params) => {
  return request({
    url: `/stores/${storeId}/medicines`,
    method: 'GET',
    data: params
  });
};
