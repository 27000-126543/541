import Taro from '@tarojs/taro';

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api' 
  : '/api';

const request = (options) => {
  const { url, method = 'GET', data = {}, header = {} } = options;
  
  const token = Taro.getStorageSync('token');
  if (token) {
    header['Authorization'] = `Bearer ${token}`;
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
            Taro.removeStorageSync('token');
            Taro.removeStorageSync('userInfo');
            Taro.navigateTo({ url: '/pages/user/login' });
            reject(res.data);
          } else {
            Taro.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            });
            reject(res.data);
          }
        } else {
          Taro.showToast({
            title: '网络错误',
            icon: 'none'
          });
          reject(res);
        }
      },
      fail: (err) => {
        Taro.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

export default request;
