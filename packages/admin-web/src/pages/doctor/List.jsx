import { useState } from 'react'
import { Table, Button, Input, Select, Space, Tag, Avatar, Modal, Form, message, Rate } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons'

const { Option } = Select

const DoctorList = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([
    { _id: '1', name: '张医生', avatar: '', gender: 'male', department: 'internal', title: '主任医师', hospital: '深圳市人民医院', consultationPrice: 30, consultationCount: 1580, goodRate: 98.5, serviceStatus: 'online', isVerified: true },
    { _id: '2', name: '李医生', avatar: '', gender: 'female', department: 'pediatrics', title: '副主任医师', hospital: '深圳市儿童医院', consultationPrice: 25, consultationCount: 2300, goodRate: 99.2, serviceStatus: 'online', isVerified: true },
    { _id: '3', name: '王医生', avatar: '', gender: 'male', department: 'dermatology', title: '主治医师', hospital: '深圳市第二人民医院', consultationPrice: 20, consultationCount: 980, goodRate: 97.8, serviceStatus: 'busy', isVerified: true },
    { _id: '4', name: '陈医生', avatar: '', gender: 'female', department: 'gynecology', title: '副主任医师', hospital: '深圳市妇幼保健院', consultationPrice: 28, consultationCount: 1250, goodRate: 98.9, serviceStatus: 'offline', isVerified: true },
    { _id: '5', name: '刘医生', avatar: '', gender: 'male', department: 'tcm', title: '主任医师', hospital: '深圳市中医院', consultationPrice: 35, consultationCount: 890, goodRate: 99.5, serviceStatus: 'offline', isVerified: true },
  ])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  const getDepartmentName = (dept) => {
    const map = {
      internal: '内科',
      surgery: '外科',
      pediatrics: '儿科',
      gynecology: '妇科',
      dermatology: '皮肤科',
      ophthalmology: '眼科',
      dental: '口腔科',
      tcm: '中医科',
      pharmacy: '药剂科',
      psychology: '心理科'
    }
    return map[dept] || dept
  }

  const getStatusTag = (status) => {
    const map = {
      online: { text: '在线', color: 'green' },
      busy: { text: '忙碌', color: 'orange' },
      offline: { text: '离线', color: 'default' }
    }
    const info = map[status] || { text: status, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const columns = [
    {
      title: '医生信息',
      key: 'doctor',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={record.avatar}>
            {record.name.slice(0, 1)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.title}</div>
          </div>
        </div>
      )
    },
    {
      title: '科室',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => getDepartmentName(dept)
    },
    {
      title: '所属医院',
      dataIndex: 'hospital',
      key: 'hospital'
    },
    {
      title: '咨询费用',
      dataIndex: 'consultationPrice',
      key: 'consultationPrice',
      render: (price) => <span className="price">¥{price}/次</span>
    },
    {
      title: '接诊量',
      dataIndex: 'consultationCount',
      key: 'consultationCount'
    },
    {
      title: '好评率',
      dataIndex: 'goodRate',
      key: 'goodRate',
      render: (rate) => <span className="status-success">{rate}%</span>
    },
    {
      title: '服务状态',
      dataIndex: 'serviceStatus',
      key: 'serviceStatus',
      render: (status) => getStatusTag(status)
    },
    {
      title: '认证状态',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (verified) => (
        <Tag color={verified ? 'green' : 'orange'}>
          {verified ? '已认证' : '待认证'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />}>编辑</Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">医生管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          添加医生
        </Button>
      </div>

      <div className="table-container">
        <div className="filter-bar">
          <Input
            placeholder="搜索医生姓名"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
          <Select placeholder="科室" style={{ width: 150 }} allowClear>
            <Option value="internal">内科</Option>
            <Option value="surgery">外科</Option>
            <Option value="pediatrics">儿科</Option>
            <Option value="gynecology">妇科</Option>
            <Option value="dermatology">皮肤科</Option>
            <Option value="tcm">中医科</Option>
          </Select>
          <Select placeholder="状态" style={{ width: 150 }} allowClear>
            <Option value="online">在线</Option>
            <Option value="busy">忙碌</Option>
            <Option value="offline">离线</Option>
          </Select>
          <Button type="primary">搜索</Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  )
}

export default DoctorList
