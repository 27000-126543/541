import axios from 'axios'
import { message } from 'antd'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 0) {
      return res
    } else if (res.code === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      message.error('登录已过期，请重新登录')
      window.location.href = '/login'
      return Promise.reject(new Error(res.message || 'Unauthorized'))
    } else {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Request failed'))
    }
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      message.error('登录已过期，请重新登录')
      window.location.href = '/login'
    } else {
      message.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export const adminApi = {
  login: (data) => request.post('/admins/login', data),
  getProfile: () => request.get('/admins/profile'),
  updatePassword: (data) => request.put('/admins/password', data),
  getAdminList: (params) => request.get('/admins/list', { params }),
  createAdmin: (data) => request.post('/admins', data),
  updateAdmin: (id, data) => request.put(`/admins/${id}`, data),
  deleteAdmin: (id) => request.delete(`/admins/${id}`)
}

export const medicineApi = {
  getList: (params) => request.get('/medicines', { params }),
  getDetail: (id) => request.get(`/medicines/detail/${id}`),
  getCategories: (params) => request.get('/medicines/categories', { params }),
  create: (data) => request.post('/medicines', data),
  update: (id, data) => request.put(`/medicines/${id}`, data),
  delete: (id) => request.delete(`/medicines/${id}`)
}

export const orderApi = {
  getList: (params) => request.get('/orders', { params }),
  getDetail: (id) => request.get(`/orders/${id}`),
  ship: (id, data) => request.post(`/orders/${id}/ship`, data),
  complete: (id) => request.post(`/orders/${id}/complete`)
}

export const prescriptionApi = {
  getList: (params) => request.get('/prescriptions/admin/list', { params }),
  getDetail: (id) => request.get(`/prescriptions/${id}`),
  review: (id, data) => request.post(`/prescriptions/admin/${id}/review`, data)
}

export const userApi = {
  getList: (params) => request.get('/users', { params }),
  getDetail: (id) => request.get(`/users/${id}`),
  updateStatus: (id, status) => request.put(`/users/${id}/status`, { status })
}

export const storeApi = {
  getList: (params) => request.get('/stores', { params }),
  getDetail: (id) => request.get(`/stores/${id}`),
  getStoreMedicines: (storeId, params) => request.get(`/stores/${storeId}/medicines`, { params }),
  create: (data) => request.post('/stores', data),
  update: (id, data) => request.put(`/stores/${id}`, data),
  stockIn: (data) => request.post('/stores/stock-in', data),
  getStockRecords: (params) => request.get('/stores/stock/records', { params }),
  getExpiryWarning: (params) => request.get('/stores/stock/expiry-warning', { params }),
  getStockWarning: (params) => request.get('/stores/stock/warning', { params }),
  getReplenishment: (params) => request.get('/stores/stock/replenishment', { params })
}

export const promotionApi = {
  getList: (params) => request.get('/promotions', { params }),
  getDetail: (id) => request.get(`/promotions/${id}`),
  create: (data) => request.post('/promotions', data),
  update: (id, data) => request.put(`/promotions/${id}`, data),
  delete: (id) => request.delete(`/promotions/${id}`)
}

export const consultationApi = {
  getList: (params) => request.get('/consultations', { params }),
  getDetail: (id) => request.get(`/consultations/${id}`),
  getDoctors: (params) => request.get('/consultations/doctors', { params })
}

export const statsApi = {
  getDashboard: (params) => request.get('/stats/dashboard', { params }),
  getSalesTrend: (params) => request.get('/stats/sales-trend', { params }),
  getCategorySales: (params) => request.get('/stats/category-sales', { params }),
  getTopMedicines: (params) => request.get('/stats/top-medicines', { params }),
  getMemberStats: (params) => request.get('/stats/member-stats', { params }),
  exportMonthly: (params) => request.get('/stats/export/monthly', { 
    params, 
    responseType: 'blob' 
  }),
  getPrediction: (params) => request.get('/stats/prediction', { params }),
  getEpidemicTrend: (params) => request.get('/stats/epidemic-trend', { params })
}

export default request
