import { useState } from 'react'
import { Card, Table, Tag, Button, Input, Space, Modal } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons'

const StoreMedicine = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState([
    { _id: '1', medicineName: '感冒灵颗粒', specification: '10g*9袋', manufacturer: '三九医药', stock: 156, availableStock: 150, price: 15.8, isActive: true },
    { _id: '2', medicineName: '布洛芬缓释胶囊', specification: '0.3g*20粒', manufacturer: '中美史克', stock: 89, availableStock: 85, price: 28.5, isActive: true },
    { _id: '3', medicineName: '维生素C片', specification: '850mg*100片', manufacturer: '养生堂', stock: 234, availableStock: 230, price: 68.0, isActive: true },
    { _id: '4', medicineName: '阿莫西林胶囊', specification: '0.25g*24粒', manufacturer: '珠海联邦', stock: 45, availableStock: 40, price: 25.0, isActive: true },
    { _id: '5', medicineName: '奥美拉唑肠溶胶囊', specification: '20mg*14粒', manufacturer: '阿斯利康', stock: 12, availableStock: 10, price: 58.0, isActive: true },
  ])

  const columns = [
    {
      title: '药品名称',
      dataIndex: 'medicineName',
      key: 'medicineName'
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
      title: '总库存',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a, b) => a.stock - b.stock
    },
    {
      title: '可用库存',
      dataIndex: 'availableStock',
      key: 'availableStock',
      render: (stock) => (
        <span className={stock < 20 ? 'status-error' : stock < 50 ? 'status-warning' : 'status-success'}>
          {stock}
        </span>
      )
    },
    {
      title: '售价',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="price">¥{price.toFixed(2)}</span>
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? '在售' : '下架'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />}>调整库存</Button>
          <Button type="link">设置价格</Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <Space size="middle">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <h2 className="page-title">门店库存 - 中心旗舰店</h2>
        </Space>
      </div>

      <Card className="table-container">
        <div className="filter-bar">
          <Input
            placeholder="搜索药品名称"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
          <Button type="primary">搜索</Button>
          <Button>重置</Button>
          <Button type="primary" style={{ marginLeft: 'auto' }}>
            入库
          </Button>
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

export default StoreMedicine
