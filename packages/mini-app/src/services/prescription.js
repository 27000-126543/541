import request from '../utils/request';

export const uploadPrescription = (data) => {
  return request({
    url: '/prescriptions/upload',
    method: 'POST',
    data
  });
};

export const getPrescriptionList = (params) => {
  return request({
    url: '/prescriptions',
    method: 'GET',
    data: params
  });
};

export const getPrescriptionDetail = (id) => {
  return request({
    url: `/prescriptions/${id}`,
    method: 'GET'
  });
};

export const checkDrugInteractions = (data) => {
  return request({
    url: '/prescriptions/check-interactions',
    method: 'POST',
    data
  });
};
