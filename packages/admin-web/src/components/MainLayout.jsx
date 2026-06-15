import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd'
import {
  DashboardOutlined,
  MedicineBoxOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  UserOutlined,
  ShopOutlined,
  StockOutlined,
  TagOutlined,
  UserAddOutlined,
  MessageOutlined,
  BarChartOutlined,
  ExportOutlined,
  SettingOutlined,
  LogoutOutlined,
  BulbOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const { Header, Sider } = Layout

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const {
    token: { colorBgContainer }
  } = theme.useToken()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '数据看板',
    },
    {
      key: 'medicine',
      icon: <MedicineBoxOutlined />,
      label: '药品管理',
      children: [
        { key: '/medicine', label: '药品列表' },
      ]
    },
    {
      key: 'order',
      icon: <ShoppingCartOutlined />,
      label: '订单管理',
      children: [
        { key: '/order', label: '订单列表' },
      ]
    },
    {
      key: 'prescription',
      icon: <FileTextOutlined />,
      label: '处方管理',
      children: [
        { key: '/prescription', label: '处方审核' },
      ]
    },
    {
      key: 'user',
      icon: <UserOutlined />,
      label: '用户管理',
      children: [
        { key: '/user', label: '用户列表' },
      ]
    },
    {
      key: 'store',
      icon: <ShopOutlined />,
      label: '门店管理',
      children: [
        { key: '/store', label: '门店列表' },
        { key: '/stock/in', label: '入库管理', icon: <StockOutlined /> },
        { key: '/stock/warning', label: '库存预警', icon: <WarningOutlined /> },
      ]
    },
    {
      key: 'promotion',
      icon: <TagOutlined />,
      label: '促销管理',
      children: [
        { key: '/promotion', label: '活动列表' },
      ]
    },
    {
      key: 'consultation',
      icon: <MessageOutlined />,
      label: '问诊管理',
      children: [
        { key: '/doctor', label: '医生管理', icon: <UserAddOutlined /> },
        { key: '/consultation', label: '问诊记录' },
      ]
    },
    {
      key: 'report',
      icon: <BarChartOutlined />,
      label: '数据报表',
      children: [
        { key: '/report/export', label: '报表导出', icon: <ExportOutlined /> },
        { key: '/report/prediction', label: '智能预测', icon: <BulbOutlined /> },
      ]
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        { key: '/admin', label: '管理员' },
        { key: '/profile', label: '个人设置' },
      ]
    }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人设置',
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  const getSelectedKey = () => {
    const pathname = location.pathname
    if (pathname.startsWith('/medicine')) return '/medicine'
    if (pathname.startsWith('/order')) return '/order'
    if (pathname.startsWith('/prescription')) return '/prescription'
    if (pathname.startsWith('/user')) return '/user'
    if (pathname.startsWith('/store') || pathname.startsWith('/stock')) return '/store'
    if (pathname.startsWith('/promotion')) return '/promotion'
    if (pathname.startsWith('/doctor') || pathname.startsWith('/consultation')) return '/consultation'
    if (pathname.startsWith('/report')) return '/report'
    if (pathname.startsWith('/admin') || pathname.startsWith('/profile')) return '/system'
    return pathname
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 16 : 20,
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <MedicineBoxOutlined style={{ marginRight: collapsed ? 0 : 10 }} />
          {!collapsed && '医药管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)'
          }}
        >
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{user?.realName || '管理员'}</span>
            </div>
          </Dropdown>
        </Header>
        {children}
      </Layout>
    </Layout>
  )
}

export default MainLayout
