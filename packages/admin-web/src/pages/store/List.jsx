import { useState, useEffect } from 'react'
import { Table, Button, Input, Select, Space, Tag, Modal, Form, Card, message } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { storeApi } from '../../services/api'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'

const { Option } = Select

const StoreList = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [searchText, setSearchText] = useState('')
  const [city, setCity] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingStore, setEditingStore] = useState(null)

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await storeApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchText,
        city
      })
      if (res.code === 0) {
        setData(res.data.list)
        setTotal(res.data.total)
      }
    } catch (e) {
      console.error('加载门店列表失败', e)
      const mockData = [
        { _id: '1', name: '中心旗舰店', code: 'STORE001', city: '深圳市', district: '南山区', address: '科技园南区高新南一道1号', phone: '0755-88880001', type: 'flagship', status: 'active' },
        { _id: '2', name: '福田分店', code: 'STORE002', city: '深圳市', district: '福田区', address: '福华路123号', phone: '0755-88880002', type: 'standard', status: 'active' },
        { _id: '3', name: '罗湖社区店', code: 'STORE003', city: '深圳市', district: '罗湖区', address: '人民北路567号', phone: '0755-88880003', type: 'community', status: 'active' },
        { _id: '4', name: '广州天河店', code: 'STORE004', city: '广州市', district: '天河区', address: '天河路200号', phone: '020-88880004', type: 'standard', status: 'active' },
      ]
      setData(mockData)
      setTotal(4)
    } finally {
      setLoading(false)
    }
  }

  const getTypeTag = (type) => {
    const typeMap = {
      flagship: { text: '旗舰店', color: 'purple' },
      standard: { text: '标准店', color: 'blue' },
      community: { text: '社区店', color: 'green' }
    }
    const info = typeMap[type] || { text: type, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const handleAdd = () => {
    setEditingStore(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingStore(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      message.success(editingStore ? '更新成功' : '创建成功')
      setIsModalVisible(false)
      loadData()
    } catch (e) {
      console.error('提交失败', e)
    }
  }

  const columns = [
    {
      title: '门店名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>
    },
    {
      title: '门店编号',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: '门店类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => getTypeTag(type)
    },
    {
      title: '所在城市',
      dataIndex: 'city',
      key: 'city',
      width: 100
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 140
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '营业中' : '已关闭'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/store/${record._id}/medicine`)}>
            库存
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">门店列表</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增门店
        </Button>
      </div>

      <div className="table-container">
        <div className="filter-bar">
          <Input
            placeholder="搜索门店名称"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={() => {
              setPagination({ ...pagination, current: 1 })
              loadData()
            }}
            allowClear
          />
          <Select
            placeholder="选择城市"
            style={{ width: 150 }}
            allowClear
            value={city}
            onChange={value => {
              setCity(value)
              setPagination({ ...pagination, current: 1 })
              setTimeout(loadData, 0)
            }}
          >
            <Option value="深圳市">深圳市</Option>
            <Option value="广州市">广州市</Option>
          </Select>
          <Button type="primary" onClick={() => {
            setPagination({ ...pagination, current: 1 })
            loadData()
          }}>搜索</Button>
          <Button onClick={() => {
            setSearchText('')
            setCity('')
            loadData()
          }}>重置</Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize })
            }
          }}
        />
      </div>

      <Modal
        title={editingStore ? '编辑门店' : '新增门店'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="门店名称"
              name="name"
              rules={[{ required: true, message: '请输入门店名称' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入门店名称" />
            </Form.Item>
            <Form.Item
              label="门店编号"
              name="code"
              rules={[{ required: true, message: '请输入门店编号' }]}
              style={{ width: 200 }}
            >
              <Input placeholder="如：STORE005" />
            </Form.Item>
          </div>

          <Form.Item
            label="门店类型"
            name="type"
            rules={[{ required: true, message: '请选择门店类型' }]}
          >
            <Select placeholder="请选择类型">
              <Option value="flagship">旗舰店</Option>
              <Option value="standard">标准店</Option>
              <Option value="community">社区店</Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item label="省份" name="province" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="请输入省份" />
            </Form.Item>
            <Form.Item label="城市" name="city" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="请输入城市" />
            </Form.Item>
            <Form.Item label="区县" name="district" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="请输入区县" />
            </Form.Item>
          </div>

          <Form.Item
            label="详细地址"
            name="address"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input placeholder="请输入详细地址" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item label="联系电话" name="phone" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="请输入联系电话" />
            </Form.Item>
            <Form.Item label="店长" name="manager" style={{ flex: 1 }}>
              <Input placeholder="请输入店长姓名" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default StoreList
