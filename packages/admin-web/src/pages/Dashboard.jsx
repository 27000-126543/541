import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Select, DatePicker, Table, Tag, Progress, List, Alert } from 'antd'
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  ShopOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  BulbOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { statsApi, storeApi, prescriptionApi } from '../services/api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

const Dashboard = () => {
  const [stats, setStats] = useState({})
  const [salesTrend, setSalesTrend] = useState([])
  const [topMedicines, setTopMedicines] = useState([])
  const [stockWarnings, setStockWarnings] = useState([])
  const [expiryWarnings, setExpiryWarnings] = useState([])
  const [pendingPrescriptions, setPendingPrescriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [city, setCity] = useState('')
  const [stores, setStores] = useState([])
  const [epidemicTrend, setEpidemicTrend] = useState({ diseases: [], recommendations: [] })
  const [prediction, setPrediction] = useState({ hotCategories: [], demandPeaks: [], suggestions: [] })

  useEffect(() => {
    loadDashboardData()
    loadSalesTrend()
    loadTopMedicines()
    loadStockWarnings()
    loadExpiryWarnings()
    loadPendingPrescriptions()
    loadEpidemicTrend()
    loadPrediction()
  }, [])

  const loadDashboardData = async () => {
    try {
      const res = await statsApi.getDashboard()
      if (res.code === 0) {
        setStats(res.data)
      }
    } catch (e) {
      console.error('加载数据失败', e)
    }
  }

  const loadSalesTrend = async () => {
    try {
      const res = await statsApi.getSalesTrend({ days: 7 })
      if (res.code === 0) {
        setSalesTrend(res.data)
      }
    } catch (e) {
      console.error('加载销售趋势失败', e)
    }
  }

  const loadTopMedicines = async () => {
    try {
      const res = await statsApi.getTopMedicines({ limit: 5 })
      if (res.code === 0) {
        setTopMedicines(res.data)
      }
    } catch (e) {
      console.error('加载热销药品失败', e)
    }
  }

  const loadStockWarnings = async () => {
    try {
      const res = await storeApi.getStockWarning({ storeId: '' })
      if (res.code === 0) {
        setStockWarnings(res.data)
      }
    } catch (e) {
      console.error('加载库存预警失败', e)
    }
  }

  const loadExpiryWarnings = async () => {
    try {
      const res = await storeApi.getExpiryWarning({ storeId: '', days: 90 })
      if (res.code === 0) {
        setExpiryWarnings(res.data)
      }
    } catch (e) {
      console.error('加载效期预警失败', e)
    }
  }

  const loadPendingPrescriptions = async () => {
    try {
      const res = await prescriptionApi.getList({ status: 'pending', pageSize: 5 })
      if (res.code === 0) {
        setPendingPrescriptions(res.data?.list || [])
      }
    } catch (e) {
      console.error('加载待审核处方失败', e)
    }
  }

  const loadEpidemicTrend = async () => {
    try {
      const res = await statsApi.getEpidemicTrend()
      if (res.code === 0) {
        setEpidemicTrend(res.data)
      }
    } catch (e) {
      console.error('加载流行病趋势失败', e)
    }
  }

  const loadPrediction = async () => {
    try {
      const res = await statsApi.getPrediction()
      if (res.code === 0) {
        setPrediction(res.data)
      }
    } catch (e) {
      console.error('加载预测数据失败', e)
    }
  }

  const salesChartOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['销售额', '订单数']
    },
    xAxis: {
      type: 'category',
      data: salesTrend.map(item => item.date)
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额(元)',
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      {
        type: 'value',
        name: '订单数'
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: salesTrend.map(item => item.salesAmount),
        areaStyle: {
          color: 'rgba(22, 119, 255, 0.1)'
        },
        lineStyle: {
          color: '#1677ff'
        },
        itemStyle: {
          color: '#1677ff'
        }
      },
      {
        name: '订单数',
        type: 'bar',
        yAxisIndex: 1,
        data: salesTrend.map(item => item.orderCount),
        itemStyle: {
          color: '#52c41a'
        }
      }
    ]
  }

  const memberPieOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '会员分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        data: [
          { value: stats.memberDistribution?.normal || 0, name: '普通会员', itemStyle: { color: '#8c8c8c' } },
          { value: stats.memberDistribution?.silver || 0, name: '银卡会员', itemStyle: { color: '#bfbfbf' } },
          { value: stats.memberDistribution?.gold || 0, name: '金卡会员', itemStyle: { color: '#faad14' } },
          { value: stats.memberDistribution?.diamond || 0, name: '钻石会员', itemStyle: { color: '#1890ff' } }
        ]
      }
    ]
  }

  const statCards = [
    {
      title: '总销售额',
      value: stats.totalSales ? `¥${stats.totalSales.toFixed(2)}` : '¥0.00',
      icon: <DollarOutlined />,
      color: '#1677ff',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: '订单总数',
      value: stats.totalOrders || 0,
      icon: <ShoppingCartOutlined />,
      color: '#52c41a',
      change: '+8.3%',
      changeType: 'positive'
    },
    {
      title: '用户总数',
      value: stats.totalUsers || 0,
      icon: <UserOutlined />,
      color: '#faad14',
      change: '+15.2%',
      changeType: 'positive'
    },
    {
      title: '门店数量',
      value: stats.totalStores || 0,
      icon: <ShopOutlined />,
      color: '#722ed1',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: '待审核处方',
      value: stats.pendingPrescriptions || 0,
      icon: <FileTextOutlined />,
      color: '#ff4d4f',
      change: '-3',
      changeType: 'negative'
    },
    {
      title: '处方审核通过率',
      value: stats.prescriptionApprovalRate ? `${stats.prescriptionApprovalRate.toFixed(1)}%` : '0%',
      icon: <MedicineBoxOutlined />,
      color: '#13c2c2',
      change: '+1.2%',
      changeType: 'positive'
    }
  ]

  const medicineColumns = [
    {
      title: '药品名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification'
    },
    {
      title: '销量',
      dataIndex: 'salesCount',
      key: 'salesCount',
      sorter: (a, b) => a.salesCount - b.salesCount
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">数据看板</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <Select
            placeholder="选择城市"
            style={{ width: 150 }}
            allowClear
            onChange={setCity}
          >
            <Option value="shenzhen">深圳市</Option>
            <Option value="guangzhou">广州市</Option>
          </Select>
          <RangePicker
            ranges={{
              '今天': [dayjs(), dayjs()],
              '本周': [dayjs().startOf('week'), dayjs().endOf('week')],
              '本月': [dayjs().startOf('month'), dayjs().endOf('month')]
            }}
          />
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} md={8} lg={4} key={index}>
            <Card className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-label">{card.title}</div>
                  <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                  <div className={`stat-change ${card.changeType}`}>
                    {card.changeType === 'positive' ? <RiseOutlined /> : <FallOutlined />}
                    {' '}{card.change} 较昨日
                  </div>
                </div>
                <div style={{
                  fontSize: 36,
                  color: card.color,
                  opacity: 0.3
                }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="销售趋势" className="dashboard-card">
            <div className="chart-container" style={{ height: 320 }}>
              <ReactECharts option={salesChartOption} style={{ height: '100%' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="会员分布" className="dashboard-card">
            <div className="chart-container" style={{ height: 320 }}>
              <ReactECharts option={memberPieOption} style={{ height: '100%' }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="热销药品 TOP5" className="dashboard-card">
            <Table
              dataSource={topMedicines}
              columns={medicineColumns}
              pagination={false}
              size="small"
              rowKey="_id"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                库存预警
              </span>
            } 
            className="dashboard-card"
          >
            <List
              size="small"
              dataSource={stockWarnings.slice(0, 5)}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.medicineName || '药品名称'}
                    description={item.specification}
                  />
                  <Tag color="red">库存: {item.stock || 0}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <FileTextOutlined style={{ color: '#1677ff', marginRight: 8 }} />
                待审核处方
              </span>
            } 
            className="dashboard-card"
          >
            {pendingPrescriptions.length > 0 ? (
              <List
                size="small"
                dataSource={pendingPrescriptions}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.prescriptionNo}
                      description={`${item.patientName} - ${new Date(item.createdAt).toLocaleDateString()}`}
                    />
                    <Tag color="orange">待审核</Tag>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                暂无待审核处方
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <BulbOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                智能预测 - 热销品类预测
              </span>
            } 
            className="dashboard-card"
          >
            <List
              size="small"
              dataSource={prediction.hotCategories || []}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.category}
                    description={item.reason}
                  />
                  <Tag color={item.predictedGrowth > 15 ? 'red' : 'green'}>
                    +{item.predictedGrowth}%
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {epidemicTrend.diseases?.length > 0 && (
        <Card 
          title={
            <span>
              <Alert style={{ marginBottom: 16 }} message="流行病趋势提醒" type="warning" showIcon />
            </span>
          }
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            {epidemicTrend.diseases.slice(0, 4).map((disease, index) => (
              <Col xs={12} md={6} key={index}>
                <Card size="small" style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{disease.name}</div>
                  <Tag color={disease.trend === 'rising' ? 'red' : disease.trend === 'falling' ? 'green' : 'blue'}>
                    {disease.trend === 'rising' ? '上升' : disease.trend === 'falling' ? '下降' : '稳定'}
                  </Tag>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8 }}>
                    {disease.affectedArea}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  )
}

export default Dashboard
