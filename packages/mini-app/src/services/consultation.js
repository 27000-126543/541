import request from '../utils/request';

export const getDoctorList = (params) => {
  return request({
    url: '/consultations/doctors',
    method: 'GET',
    data: params
  });
};

export const getDoctorDetail = (id) => {
  return request({
    url: `/consultations/doctors/${id}`,
    method: 'GET'
  });
};

export const getDepartments = () => {
  return request({
    url: '/consultations/departments',
    method: 'GET'
  });
};

export const createConsultation = (data) => {
  return request({
    url: '/consultations',
    method: 'POST',
    data
  });
};

export const getConsultationList = (params) => {
  return request({
    url: '/consultations',
    method: 'GET',
    data: params
  });
};

export const getConsultationDetail = (id) => {
  return request({
    url: `/consultations/${id}`,
    method: 'GET'
  });
};

export const sendMessage = (id, data) => {
  return request({
    url: `/consultations/${id}/messages`,
    method: 'POST',
    data
  });
};

export const rateConsultation = (id, data) => {
  return request({
    url: `/consultations/${id}/rate`,
    method: 'POST',
    data
  });
};
