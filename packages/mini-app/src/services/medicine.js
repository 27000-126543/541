import request from '../utils/request';

export const getMedicineList = (params) => {
  return request({
    url: '/medicines',
    method: 'GET',
    data: params
  });
};

export const getMedicineDetail = (id, params) => {
  return request({
    url: `/medicines/detail/${id}`,
    method: 'GET',
    data: params
  });
};

export const getCategories = (params) => {
  return request({
    url: '/medicines/categories',
    method: 'GET',
    data: params
  });
};

export const getRecommendMedicines = (params) => {
  return request({
    url: '/medicines/recommend',
    method: 'GET',
    data: params
  });
};

export const searchMedicines = (params) => {
  return request({
    url: '/medicines/search',
    method: 'GET',
    data: params
  });
};

export const getHotKeywords = () => {
  return request({
    url: '/medicines/hot-keywords',
    method: 'GET'
  });
};
