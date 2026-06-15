import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Layout } from 'antd'
import Login from './pages/Login'
import MainLayout from './components/MainLayout'
import Dashboard from './pages/Dashboard'
import MedicineList from './pages/medicine/List'
import MedicineForm from './pages/medicine/Form'
import OrderList from './pages/order/List'
import OrderDetail from './pages/order/Detail'
import PrescriptionList from './pages/prescription/List'
import UserList from './pages/user/List'
import StoreList from './pages/store/List'
import StoreMedicine from './pages/store/Medicine'
import StockIn from './pages/stock/In'
import StockWarning from './pages/stock/Warning'
import PromotionList from './pages/promotion/List'
import PromotionForm from './pages/promotion/Form'
import DoctorList from './pages/doctor/List'
import ConsultationList from './pages/consultation/List'
import ReportExport from './pages/report/Export'
import Prediction from './pages/report/Prediction'
import AdminList from './pages/admin/List'
import Profile from './pages/profile/Profile'
import { AuthProvider, useAuth } from './context/AuthContext'

const { Content } = Layout

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    if (location.pathname === '/login') {
      return <Login />
    }
    return <Navigate to="/login" replace />
  }

  return (
    <MainLayout>
      <Content style={{ margin: '24px', minHeight: 'calc(100vh - 112px)' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/medicine" element={<MedicineList />} />
          <Route path="/medicine/new" element={<MedicineForm />} />
          <Route path="/medicine/:id/edit" element={<MedicineForm />} />
          
          <Route path="/order" element={<OrderList />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          
          <Route path="/prescription" element={<PrescriptionList />} />
          
          <Route path="/user" element={<UserList />} />
          
          <Route path="/store" element={<StoreList />} />
          <Route path="/store/:id/medicine" element={<StoreMedicine />} />
          
          <Route path="/stock/in" element={<StockIn />} />
          <Route path="/stock/warning" element={<StockWarning />} />
          
          <Route path="/promotion" element={<PromotionList />} />
          <Route path="/promotion/new" element={<PromotionForm />} />
          <Route path="/promotion/:id/edit" element={<PromotionForm />} />
          
          <Route path="/doctor" element={<DoctorList />} />
          <Route path="/consultation" element={<ConsultationList />} />
          
          <Route path="/report/export" element={<ReportExport />} />
          <Route path="/report/prediction" element={<Prediction />} />
          
          <Route path="/admin" element={<AdminList />} />
          <Route path="/profile" element={<Profile />} />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Content>
    </MainLayout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
