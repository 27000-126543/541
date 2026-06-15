import request from '../utils/request';

export const login = (data) => {
  return request({
    url: '/users/login',
    method: 'POST',
    data
  });
};

export const register = (data) => {
  return request({
    url: '/users/register',
    method: 'POST',
    data
  });
};

export const getUserInfo = () => {
  return request({
    url: '/users/profile',
    method: 'GET'
  });
};

export const updateUserInfo = (data) => {
  return request({
    url: '/users/profile',
    method: 'PUT',
    data
  });
};

export const updateHealthProfile = (data) => {
  return request({
    url: '/users/health-profile',
    method: 'PUT',
    data
  });
};

export const getFamilyMembers = () => {
  return request({
    url: '/users/family-members',
    method: 'GET'
  });
};

export const addFamilyMember = (data) => {
  return request({
    url: '/users/family-members',
    method: 'POST',
    data
  });
};

export const updateFamilyMember = (id, data) => {
  return request({
    url: `/users/family-members/${id}`,
    method: 'PUT',
    data
  });
};

export const deleteFamilyMember = (id) => {
  return request({
    url: `/users/family-members/${id}`,
    method: 'DELETE'
  });
};

export const getAddresses = () => {
  return request({
    url: '/users/addresses',
    method: 'GET'
  });
};

export const addAddress = (data) => {
  return request({
    url: '/users/addresses',
    method: 'POST',
    data
  });
};

export const updateAddress = (id, data) => {
  return request({
    url: `/users/addresses/${id}`,
    method: 'PUT',
    data
  });
};

export const deleteAddress = (id) => {
  return request({
    url: `/users/addresses/${id}`,
    method: 'DELETE'
  });
};
