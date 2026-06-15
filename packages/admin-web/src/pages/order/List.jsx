import { useState, useEffect } from 'react'
import { Table, Button, Input, Select, Space, Tag, Card, DatePicker, Modal, Descriptions } from 'antd'
import { SearchOutlined, EyeOutlined, ExportOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { orderApi } from '../../services/api'
import dayjs from 'dayjs'

const { Option } = Select
const { RangePicker } = DatePicker

const OrderList = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [detailModal, setDetailModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        status,
        type
      }
      if (searchText) {
        params.keyword = searchText
      }
      const res = await orderApi.getList(params)
      if (res.code === 0) {
        setData(res.data.list)
        setTotal(res.data.total)
      }
    } catch (e) {
      console.error('加载订单列表失败', e)
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status) => {
    const statusMap = {
      pending_payment: { text: '待支付', color: 'orange' },
      paid: { text: '待发货', color: 'blue' },
      processing: { text: '备货中', color: 'processing' },
      shipped: { text: '配送中', color: 'cyan' },
      delivered: { text: '已完成', color: 'green' },
      picked_up: { text: '已取货', color: 'green' },
      cancelled: { text: '已取消', color: 'default' },
      refunded: { text: '已退款', color: 'default' }
    }
    const info = statusMap[status] || { text: status, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const getTypeTag = (type) => {
    return type === 'delivery' ? <Tag color="blue">配送</Tag> : <Tag color="green">自提</Tag>
  }

  const viewDetail = async (id) => {
    try {
      const res = await orderApi.getDetail(id)
      if (res.code === 0) {
        setCurrentOrder(res.data)
        setDetailModal(true)
      }
    } catch (e) {
      console.error('加载订单详情失败', e)
    }
  }

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
      render: (text) => <a>{text}</a>
    },
    {
      title: '订单类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => getTypeTag(type)
    },
    {
      title: '商品信息',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <div>
          {items?.slice(0, 2).map((item, index) => (
            <div key={index} style={{ fontSize: 12, color: '#666' }}>
              {item.medicineName} x{item.quantity}
            </div>
          ))}
          {items?.length > 2 && (
            <div style={{ fontSize: 12, color: '#999' }}>等{items.length}件商品</div>
          )}
        </div>
      )
    },
    {
      title: '订单金额',
      dataIndex: 'payAmount',
      key: 'payAmount',
      width: 120,
      render: (amount) => <span className="price">¥{amount?.toFixed(2)}</span>
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '支付方式',
      dataIndex: 'payMethod',
      key: 'payMethod',
      width: 100,
      render: (method) => {
        const methodMap = {
          wechat: '微信支付',
          alipay: '支付宝',
          insurance: '医保支付',
          balance: '余额支付'
        }
        return methodMap[method] || method
      }
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => viewDetail(record._id)}
          >
            详情
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">订单列表</h2>
        <Button icon={<ExportOutlined />}>导出</Button>
      </div>

      <div className="table-container">
        <div className="filter-bar">
          <Input
            placeholder="搜索订单号"
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
            placeholder="订单状态"
            style={{ width: 150 }}
            allowClear
            value={status}
            onChange={value => {
              setStatus(value)
              setPagination({ ...pagination, current: 1 })
              setTimeout(loadData, 0)
            }}
          >
            <Option value="pending_payment">待支付</Option>
            <Option value="paid">待发货</Option>
            <Option value="processing">备货中</Option>
            <Option value="shipped">配送中</Option>
            <Option value="delivered">已完成</Option>
            <Option value="picked_up">已取货</Option>
            <Option value="cancelled">已取消</Option>
          </Select>
          <Select
            placeholder="订单类型"
            style={{ width: 130 }}
            allowClear
            value={type}
            onChange={value => {
              setType(value)
              setPagination({ ...pagination, current: 1 })
              setTimeout(loadData, 0)
            }}
          >
            <Option value="delivery">配送订单</Option>
            <Option value="pickup">自提订单</Option>
          </Select>
          <RangePicker />
          <Button type="primary" onClick={() => {
            setPagination({ ...pagination, current: 1 })
            loadData()
          }}>搜索</Button>
          <Button onClick={() => {
            setSearchText('')
            setStatus('')
            setType('')
            setPagination({ current: 1, pageSize: 10 })
            setTimeout(loadData, 0)
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
        title="订单详情"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>关闭</Button>
        ]}
        width={800}
      >
        {currentOrder && (
          <div>
            <Descriptions title="基本信息" column={2} bordered size="small">
              <Descriptions.Item label="订单编号">{currentOrder.orderNo}</Descriptions.Item>
              <Descriptions.Item label="订单状态">{getStatusTag(currentOrder.status)}</Descriptions.Item>
              <Descriptions.Item label="订单类型">{getTypeTag(currentOrder.type)}</Descriptions.Item>
              <Descriptions.Item label="下单时间">
                {dayjs(currentOrder.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="支付方式">{currentOrder.payMethod}</Descriptions.Item>
              <Descriptions.Item label="支付时间">
                {currentOrder.payTime ? dayjs(currentOrder.payTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <h4 style={{ marginBottom: 12 }}>商品信息</h4>
              {currentOrder.items?.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div>
                    <div>{item.medicineName}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{item.specification}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>¥{item.price?.toFixed(2)}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>x{item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <div>商品金额：<span className="price">¥{currentOrder.goodsAmount?.toFixed(2)}</span></div>
              <div>配送费：¥{currentOrder.deliveryFee?.toFixed(2)}</div>
              <div>优惠金额：-¥{currentOrder.discountAmount?.toFixed(2)}</div>
              <div>会员优惠：-¥{currentOrder.memberDiscount?.toFixed(2)}</div>
              {currentOrder.insurancePay > 0 && (
                <div>医保支付：-¥{currentOrder.insurancePay?.toFixed(2)}</div>
              )}
              <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 8 }}>
                实付金额：<span className="price" style={{ fontSize: 20 }}>¥{currentOrder.payAmount?.toFixed(2)}</span>
              </div>
            </div>

            {currentOrder.type === 'delivery' && currentOrder.address && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 12 }}>收货地址</h4>
                <div>
                  {currentOrder.address.name} {currentOrder.address.phone}
                </div>
                <div style={{ color: '#666' }}>
                  {currentOrder.address.province}{currentOrder.address.city}
                  {currentOrder.address.district}{currentOrder.address.detail}
                </div>
              </div>
            )}

            {currentOrder.type === 'pickup' && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 12 }}>取货信息</h4>
                <div>取货码：<Tag color="blue">{currentOrder.pickupCode}</Tag></div>
                {currentOrder.pickupTime && (
                  <div>预计取货时间：{dayjs(currentOrder.pickupTime).format('YYYY-MM-DD HH:mm')}</div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default OrderList
