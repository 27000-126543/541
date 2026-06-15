import Taro from '@tarojs/taro';

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api' 
  : '/api';

const request = (options) => {
  const { url, method = 'GET', data = {}, header = {} } = options;
  
  try {
    const token = Taro.getStorageSync('token');
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn('读取token失败', e);
  }
  
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data);
          } else if (res.data.code === 401) {
            try {
              Taro.removeStorageSync('token');
              Taro.removeStorageSync('userInfo');
            } catch (e) {}
            reject(res.data);
          } else {
            try {
              Taro.showToast({
                title: res.data.message || '请求失败',
                icon: 'none'
              });
            } catch (e) {}
            reject(res.data);
          }
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        console.warn('请求失败:', url, err);
        reject(err);
      }
    });
  });
};

export default request;
