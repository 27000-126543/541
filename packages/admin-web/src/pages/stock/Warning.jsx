import { useState, useEffect } from 'react'
import { Card, Table, Tabs, Tag, Select, Button, Alert, Space } from 'antd'
import { WarningOutlined, ClockCircleOutlined, RiseOutlined } from '@ant-design/icons'
import { storeApi } from '../../services/api'

const { TabPane } = Tabs
const { Option } = Select

const StockWarning = () => {
  const [activeTab, setActiveTab] = useState('stock')
  const [storeId, setStoreId] = useState('')
  const [stockWarnings, setStockWarnings] = useState([])
  const [expiryWarnings, setExpiryWarnings] = useState([])
  const [replenishment, setReplenishment] = useState([])

  useEffect(() => {
    loadStockWarnings()
    loadExpiryWarnings()
    loadReplenishment()
  }, [storeId])

  const loadStockWarnings = async () => {
    try {
      const mockData = [
        { _id: '1', medicineName: '奥美拉唑肠溶胶囊', specification: '20mg*14粒', currentStock: 12, warningThreshold: 20, urgency: 'high' },
        { _id: '2', medicineName: '阿莫西林胶囊', specification: '0.25g*24粒', currentStock: 28, warningThreshold: 30, urgency: 'medium' },
        { _id: '3', medicineName: '电子血压计', specification: 'HEM-7136', currentStock: 5, warningThreshold: 10, urgency: 'high' },
        { _id: '4', medicineName: '六味地黄丸', specification: '9g*10丸', currentStock: 18, warningThreshold: 20, urgency: 'low' },
        { _id: '5', medicineName: '复方甘草片', specification: '100片', currentStock: 8, warningThreshold: 15, urgency: 'high' },
      ]
      setStockWarnings(mockData)
    } catch (e) {
      console.error('加载库存预警失败', e)
    }
  }

  const loadExpiryWarnings = async () => {
    try {
      const mockData = [
        { _id: '1', medicineName: '维生素C片', specification: '850mg*100片', batchNumber: 'B20230101', expiryDate: '2026-01-15', quantity: 50, daysLeft: 215 },
        { _id: '2', medicineName: '感冒灵颗粒', specification: '10g*9袋', batchNumber: 'B20230301', expiryDate: '2025-09-30', quantity: 30, daysLeft: 107 },
        { _id: '3', medicineName: '布洛芬缓释胶囊', specification: '0.3g*20粒', batchNumber: 'B20230601', expiryDate: '2025-06-01', quantity: 20, daysLeft: 350 },
      ]
      setExpiryWarnings(mockData)
    } catch (e) {
      console.error('加载效期预警失败', e)
    }
  }

  const loadReplenishment = async () => {
    try {
      const mockData = [
        { _id: '1', medicineName: '感冒灵颗粒', specification: '10g*9袋', currentStock: 56, avgDailySales: 5, suggestedQuantity: 94, urgency: 'medium' },
        { _id: '2', medicineName: '布洛芬缓释胶囊', specification: '0.3g*20粒', currentStock: 23, avgDailySales: 8, suggestedQuantity: 217, urgency: 'high' },
        { _id: '3', medicineName: '维生素C片', specification: '850mg*100片', currentStock: 120, avgDailySales: 12, suggestedQuantity: 240, urgency: 'medium' },
        { _id: '4', medicineName: '连花清瘟胶囊', specification: '0.35g*24粒', currentStock: 8, avgDailySales: 15, suggestedQuantity: 442, urgency: 'high' },
        { _id: '5', medicineName: '电子血压计', specification: 'HEM-7136', currentStock: 5, avgDailySales: 2, suggestedQuantity: 55, urgency: 'high' },
      ]
      setReplenishment(mockData)
    } catch (e) {
      console.error('加载补货建议失败', e)
    }
  }

  const stockColumns = [
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
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock, record) => (
        <span className="status-error">{stock}</span>
      )
    },
    {
      title: '预警阈值',
      dataIndex: 'warningThreshold',
      key: 'warningThreshold'
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency) => {
        const colorMap = { high: 'red', medium: 'orange', low: 'blue' }
        const textMap = { high: '高', medium: '中', low: '低' }
        return <Tag color={colorMap[urgency]}>{textMap[urgency]}</Tag>
      }
    }
  ]

  const expiryColumns = [
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
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber'
    },
    {
      title: '有效期至',
      dataIndex: 'expiryDate',
      key: 'expiryDate'
    },
    {
      title: '剩余数量',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: '剩余天数',
      dataIndex: 'daysLeft',
      key: 'daysLeft',
      render: (days) => {
        const color = days < 90 ? 'red' : days < 180 ? 'orange' : 'green'
        return <Tag color={color}>{days}天</Tag>
      }
    }
  ]

  const replenishColumns = [
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
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock'
    },
    {
      title: '日均销量',
      dataIndex: 'avgDailySales',
      key: 'avgDailySales'
    },
    {
      title: '建议补货量',
      dataIndex: 'suggestedQuantity',
      key: 'suggestedQuantity',
      render: (qty) => <span className="status-warning">{qty}</span>
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency) => {
        const colorMap = { high: 'red', medium: 'orange', low: 'blue' }
        const textMap = { high: '紧急', medium: '一般', low: '低' }
        return <Tag color={colorMap[urgency]}>{textMap[urgency]}</Tag>
      }
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">库存预警</h2>
        <Space>
          <Select
            placeholder="选择门店"
            style={{ width: 200 }}
            allowClear
            value={storeId}
            onChange={setStoreId}
          >
            <Option value="">全部门店</Option>
            <Option value="1">中心旗舰店</Option>
            <Option value="2">福田分店</Option>
          </Select>
          <Button type="primary">生成补货单</Button>
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Alert
          message={`库存预警：${stockWarnings.length}种药品库存不足`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
        />
      </div>

      <Card className="table-container">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><WarningOutlined />库存预警</span>} key="stock">
            <Table
              columns={stockColumns}
              dataSource={stockWarnings}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={<span><ClockCircleOutlined />效期预警</span>} key="expiry">
            <Table
              columns={expiryColumns}
              dataSource={expiryWarnings}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={<span><RiseOutlined />补货建议</span>} key="replenishment">
            <Table
              columns={replenishColumns}
              dataSource={replenishment}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default StockWarning
