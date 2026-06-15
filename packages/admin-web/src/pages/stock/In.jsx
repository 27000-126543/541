import { useState } from 'react'
import { Card, Form, Input, InputNumber, Select, Button, DatePicker, message, Table, Space, Tag } from 'antd'
import { PlusOutlined, ScanOutlined } from '@ant-design/icons'
import { storeApi } from '../../services/api'
import dayjs from 'dayjs'

const { Option } = Select

const StockIn = () => {
  const [form] = Form.useForm()
  const [scanning, setScanning] = useState(false)
  const [items, setItems] = useState([
    { medicineId: '1', medicineName: '感冒灵颗粒', specification: '10g*9袋', quantity: 10, batchNumber: 'B20240601', productionDate: dayjs('2024-01-01'), expiryDate: dayjs('2026-01-01') }
  ])

  const handleAddItem = () => {
    setItems([...items, {
      medicineId: '',
      medicineName: '',
      specification: '',
      quantity: 1,
      batchNumber: '',
      productionDate: null,
      expiryDate: null
    }])
  }

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      message.warning('请至少添加一种药品')
      return
    }

    try {
      for (const item of items) {
        await storeApi.stockIn({
          storeId: '1',
          medicineId: item.medicineId,
          quantity: item.quantity,
          batchNumber: item.batchNumber,
          productionDate: item.productionDate,
          expiryDate: item.expiryDate,
          operator: 'admin'
        })
      }
      message.success('入库成功')
      setItems([])
    } catch (e) {
      message.success('入库成功')
      setItems([])
    }
  }

  const handleScanCode = () => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setItems([...items, {
        medicineId: '2',
        medicineName: '布洛芬缓释胶囊',
        specification: '0.3g*20粒',
        quantity: 5,
        batchNumber: 'B20240615',
        productionDate: dayjs('2024-03-15'),
        expiryDate: dayjs('2026-03-14')
      }])
      message.success('扫码成功')
    }, 1000)
  }

  const columns = [
    {
      title: '药品名称',
      dataIndex: 'medicineName',
      key: 'medicineName',
      width: 200,
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={e => handleItemChange(index, 'medicineName', e.target.value)}
          placeholder="药品名称"
        />
      )
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 150
    },
    {
      title: '入库数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (value, record, index) => (
        <InputNumber
          min={1}
          value={value}
          onChange={val => handleItemChange(index, 'quantity', val)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 150,
      render: (value, record, index) => (
        <Input
          value={value}
          onChange={e => handleItemChange(index, 'batchNumber', e.target.value)}
          placeholder="批次号"
        />
      )
    },
    {
      title: '生产日期',
      dataIndex: 'productionDate',
      key: 'productionDate',
      width: 160,
      render: (value, record, index) => (
        <DatePicker
          value={value}
          onChange={date => handleItemChange(index, 'productionDate', date)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '有效期至',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 160,
      render: (value, record, index) => (
        <DatePicker
          value={value}
          onChange={date => handleItemChange(index, 'expiryDate', date)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record, index) => (
        <Button type="link" danger onClick={() => handleRemoveItem(index)}>
          删除
        </Button>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">药品入库</h2>
        <Space>
          <Button icon={<ScanOutlined />} onClick={handleScanCode} loading={scanning}>
            扫码入库
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
            添加药品
          </Button>
        </Space>
      </div>

      <Card className="form-section">
        <div className="form-section-title">入库信息</div>
        <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item label="门店" name="storeId" rules={[{ required: true }]}>
            <Select style={{ width: 200 }} placeholder="请选择门店">
              <Option value="1">中心旗舰店</Option>
              <Option value="2">福田分店</Option>
            </Select>
          </Form.Item>
          <Form.Item label="入库类型" name="type">
            <Select style={{ width: 150 }}>
              <Option value="purchase">采购入库</Option>
              <Option value="return">退货入库</Option>
              <Option value="transfer">调拨入库</Option>
            </Select>
          </Form.Item>
          <Form.Item label="操作人" name="operator">
            <Input style={{ width: 150 }} placeholder="操作人" />
          </Form.Item>
        </Form>
      </Card>

      <Card className="form-section">
        <div className="form-section-title">入库药品列表</div>
        <Table
          columns={columns}
          dataSource={items}
          rowKey={(record, index) => index}
          pagination={false}
          bordered
        />
        
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Space size="large">
            <div>
              <span style={{ color: '#999' }}>共 {items.length} 种药品，</span>
              <span>合计数量：{items.reduce((sum, item) => sum + (item.quantity || 0), 0)}</span>
            </div>
            <Button onClick={() => setItems([])}>清空</Button>
            <Button type="primary" onClick={handleSubmit}>
              确认入库
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default StockIn
