import { useState } from 'react'
import { Table, Button, Tag, Space, Card, Modal, Form, Input, Select, DatePicker, InputNumber, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Option } = Select

const PromotionList = () => {
  const navigate = useNavigate()
  const [data, setData] = useState([
    { _id: '1', name: '满减活动', type: 'full_reduction', status: 'active', startTime: dayjs().subtract(7, 'day').toDate(), endTime: dayjs().add(30, 'day').toDate(), useCount: 5680 },
    { _id: '2', name: '限时秒杀', type: 'flash_sale', status: 'active', startTime: dayjs().subtract(1, 'day').toDate(), endTime: dayjs().add(7, 'day').toDate(), useCount: 2340 },
    { _id: '3', name: '新人专享', type: 'discount', status: 'active', startTime: dayjs().subtract(30, 'day').toDate(), endTime: dayjs().add(90, 'day').toDate(), useCount: 8900 },
    { _id: '4', name: '夏季养生节', type: 'full_reduction', status: 'ended', startTime: dayjs().subtract(60, 'day').toDate(), endTime: dayjs().subtract(30, 'day').toDate(), useCount: 12500 },
  ])
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')

  const getTypeTag = (type) => {
    const typeMap = {
      full_reduction: { text: '满减', color: 'blue' },
      flash_sale: { text: '限时秒杀', color: 'red' },
      group_buy: { text: '拼团', color: 'green' },
      discount: { text: '折扣', color: 'purple' },
      coupon: { text: '优惠券', color: 'orange' }
    }
    const info = typeMap[type] || { text: type, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const getStatusTag = (status) => {
    const statusMap = {
      draft: { text: '草稿', color: 'default' },
      active: { text: '进行中', color: 'green' },
      ended: { text: '已结束', color: 'grey' },
      cancelled: { text: '已取消', color: 'red' }
    }
    const info = statusMap[status] || { text: status, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '活动类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => getTypeTag(type)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '使用次数',
      dataIndex: 'useCount',
      key: 'useCount'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/promotion/${record._id}/edit`)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">促销活动</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/promotion/new')}>
          新建活动
        </Button>
      </div>

      <Card className="table-container">
        <div className="filter-bar">
          <Select
            placeholder="活动类型"
            style={{ width: 150 }}
            allowClear
            value={type}
            onChange={setType}
          >
            <Option value="full_reduction">满减活动</Option>
            <Option value="flash_sale">限时秒杀</Option>
            <Option value="group_buy">拼团活动</Option>
            <Option value="discount">折扣活动</Option>
          </Select>
          <Select
            placeholder="活动状态"
            style={{ width: 150 }}
            allowClear
            value={status}
            onChange={setStatus}
          >
            <Option value="draft">草稿</Option>
            <Option value="active">进行中</Option>
            <Option value="ended">已结束</Option>
          </Select>
          <Button type="primary">搜索</Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}

export default PromotionList
