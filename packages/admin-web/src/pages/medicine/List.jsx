import { useState, useEffect } from 'react'
import { Table, Button, Input, Select, Space, Tag, Modal, message, Popconfirm, Image } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { medicineApi } from '../../services/api'

const { Option } = Select

const MedicineList = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [searchText, setSearchText] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    loadData()
    loadCategories()
  }, [pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchText,
        type
      }
      const res = await medicineApi.getList(params)
      if (res.code === 0) {
        setData(res.data.list)
        setTotal(res.data.total)
      }
    } catch (e) {
      console.error('加载药品列表失败', e)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await medicineApi.getCategories()
      if (res.code === 0) {
        setCategories(res.data)
      }
    } catch (e) {
      console.error('加载分类失败', e)
    }
  }

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 })
    loadData()
  }

  const handleTypeChange = (value) => {
    setType(value)
    setPagination({ ...pagination, current: 1 })
    setTimeout(() => loadData(), 0)
  }

  const handleDelete = async (id) => {
    try {
      await medicineApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (e) {
      console.error('删除失败', e)
    }
  }

  const getTypeTag = (type) => {
    const typeMap = {
      otc: { text: 'OTC', color: 'blue' },
      prescription: { text: '处方药', color: 'orange' },
      health: { text: '保健品', color: 'green' },
      medical_device: { text: '医疗器械', color: 'default' },
      others: { text: '其他', color: 'default' }
    }
    const info = typeMap[type] || { text: type, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const columns = [
    {
      title: '药品图片',
      dataIndex: 'coverImage',
      key: 'coverImage',
      width: 80,
      render: (text, record) => (
        <div style={{
          width: 60,
          height: 60,
          background: '#f5f5f5',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28
        }}>
          💊
        </div>
      )
    },
    {
      title: '药品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>
    },
    {
      title: '通用名',
      dataIndex: 'genericName',
      key: 'genericName'
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification'
    },
    {
      title: '生产厂家',
      dataIndex: 'manufacturer',
      key: 'manufacturer'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => getTypeTag(type)
    },
    {
      title: '售价',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="price">¥{price?.toFixed(2)}</span>
    },
    {
      title: '销量',
      dataIndex: 'salesCount',
      key: 'salesCount',
      sorter: (a, b) => a.salesCount - b.salesCount
    },
    {
      title: '状态',
      dataIndex: 'isOnSale',
      key: 'isOnSale',
      render: (onSale) => (
        <Tag color={onSale ? 'green' : 'red'}>
          {onSale ? '在售' : '下架'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/medicine/${record._id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个药品吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">药品列表</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/medicine/new')}>
          新增药品
        </Button>
      </div>

      <div className="table-container">
        <div className="filter-bar">
          <Input
            placeholder="搜索药品名称/通用名"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
          />
          <Select
            placeholder="药品类型"
            style={{ width: 150 }}
            allowClear
            value={type}
            onChange={handleTypeChange}
          >
            <Option value="otc">OTC药品</Option>
            <Option value="prescription">处方药</Option>
            <Option value="health">保健品</Option>
            <Option value="medical_device">医疗器械</Option>
          </Select>
          <Select
            placeholder="药品分类"
            style={{ width: 150 }}
            allowClear
            value={category}
            onChange={setCategory}
          >
            {categories.map(cat => (
              <Option key={cat._id || cat.code} value={cat.code || cat._id}>
                {cat.name}
              </Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleSearch}>搜索</Button>
          <Button onClick={() => {
            setSearchText('')
            setType('')
            setCategory('')
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
    </div>
  )
}

export default MedicineList
