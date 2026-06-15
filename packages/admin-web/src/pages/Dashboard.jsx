import { useState, useEffect, useCallback } from 'react'
import { Row, Col, Card, Statistic, Select, DatePicker, Table, Tag, Progress, List, Alert, Empty } from 'antd'
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
  BulbOutlined,
  SendOutlined,
  MessageOutlined,
  CrownOutlined
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
  const [pendingPrescriptions, setPendingPrescriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [city, setCity] = useState(undefined)
  const [dateRange, setDateRange] = useState(null)
  const [epidemicTrend, setEpidemicTrend] = useState({ diseases: [], recommendations: [] })
  const [prediction, setPrediction] = useState({ hotCategories: [], demandPeaks: [], suggestions: [] })

  const getFilterParams = useCallback(() => {
    const params = {}
    if (city) params.city = city
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.startDate = dateRange[0].format('YYYY-MM-DD')
      params.endDate = dateRange[1].format('YYYY-MM-DD')
    }
    return params
  }, [city, dateRange])

  const loadAllData = useCallback(async () => {
    setLoading(true)
    const params = getFilterParams()
    await Promise.allSettled([
      loadDashboardData(params),
      loadSalesTrend(params),
      loadTopMedicines(params),
      loadStockWarnings(params),
      loadPendingPrescriptions(params)
    ])
    setLoading(false)
  }, [getFilterParams])

  useEffect(() => {
    loadAllData()
    loadEpidemicTrend()
    loadPrediction()
  }, [loadAllData])

  const handleCityChange = (value) => {
    setCity(value || undefined)
  }

  const handleDateRangeChange = (dates) => {
    setDateRange(dates || null)
  }

  const handleClearFilter = () => {
    setCity(undefined)
    setDateRange(null)
  }

  const loadDashboardData = async (params = {}) => {
    try {
      const res = await statsApi.getDashboard(params)
      if (res.code === 0) {
        setStats(res.data || {})
      }
    } catch (e) {
      console.error('加载数据失败', e)
    }
  }

  const loadSalesTrend = async (params = {}) => {
    try {
      const res = await statsApi.getSalesTrend({ ...params, days: 7 })
      if (res.code === 0) {
        setSalesTrend(res.data || [])
      }
    } catch (e) {
      console.error('加载销售趋势失败', e)
    }
  }

  const loadTopMedicines = async (params = {}) => {
    try {
      const res = await statsApi.getTopMedicines({ ...params, limit: 5 })
      if (res.code === 0) {
        setTopMedicines(res.data || [])
      }
    } catch (e) {
      console.error('加载热销药品失败', e)
    }
  }

  const loadStockWarnings = async (params = {}) => {
    try {
      const res = await storeApi.getStockWarning({ ...params, storeId: '' })
      if (res.code === 0) {
        setStockWarnings(res.data || [])
      }
    } catch (e) {
      console.error('加载库存预警失败', e)
    }
  }

  const loadPendingPrescriptions = async (params = {}) => {
    try {
      const res = await prescriptionApi.getList({ ...params, status: 'pending', pageSize: 5 })
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
      if (res.code === 0 && res.data) {
        setEpidemicTrend(res.data)
      }
    } catch (e) {
      console.error('加载流行病趋势失败', e)
    }
  }

  const loadPrediction = async () => {
    try {
      const res = await statsApi.getPrediction()
      if (res.code === 0 && res.data) {
        setPrediction(res.data)
      }
    } catch (e) {
      console.error('加载预测数据失败', e)
    }
  }

  const salesChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['销售额', '订单数'] },
    xAxis: {
      type: 'category',
      data: (salesTrend || []).map(item => item.date)
    },
    yAxis: [
      { type: 'value', name: '销售额(元)', axisLabel: { formatter: '¥{value}' } },
      { type: 'value', name: '订单数' }
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: (salesTrend || []).map(item => item.salesAmount),
        areaStyle: { color: 'rgba(22, 119, 255, 0.1)' },
        lineStyle: { color: '#1677ff' },
        itemStyle: { color: '#1677ff' }
      },
      {
        name: '订单数',
        type: 'bar',
        yAxisIndex: 1,
        data: (salesTrend || []).map(item => item.orderCount),
        itemStyle: { color: '#52c41a' }
      }
    ]
  }

  const memberPieOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      name: '会员分布',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      data: [
        { value: stats.memberDistribution?.normal || 0, name: '普通会员', itemStyle: { color: '#8c8c8c' } },
        { value: stats.memberDistribution?.silver || 0, name: '银卡会员', itemStyle: { color: '#bfbfbf' } },
        { value: stats.memberDistribution?.gold || 0, name: '金卡会员', itemStyle: { color: '#faad14' } },
        { value: stats.memberDistribution?.diamond || 0, name: '钻石会员', itemStyle: { color: '#1890ff' } }
      ]
    }]
  }

  const statCards = [
    {
      title: '总销售额',
      value: stats.totalSales ? `¥${Number(stats.totalSales).toFixed(2)}` : '¥0.00',
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
      title: '配送订单完成率',
      value: stats.deliveryCompletionRate != null ? `${Number(stats.deliveryCompletionRate).toFixed(1)}%` : '0%',
      icon: <SendOutlined />,
      color: '#36cfc9',
      change: '+2.1%',
      changeType: 'positive'
    },
    {
      title: '问诊转化率',
      value: stats.consultationConversionRate != null ? `${Number(stats.consultationConversionRate).toFixed(1)}%` : '0%',
      icon: <MessageOutlined />,
      color: '#597ef7',
      change: '+3.4%',
      changeType: 'positive'
    },
    {
      title: '医保支付占比',
      value: stats.insurancePaymentRatio != null ? `${Number(stats.insurancePaymentRatio).toFixed(1)}%` : '0%',
      icon: <FileTextOutlined />,
      color: '#73d13d',
      change: '+1.8%',
      changeType: 'positive'
    },
    {
      title: '会员活跃度',
      value: stats.memberActivityRate != null ? `${Number(stats.memberActivityRate).toFixed(1)}%` : '0%',
      icon: <CrownOutlined />,
      color: '#ff7a45',
      change: '+5.6%',
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
      value: stats.prescriptionApprovalRate != null ? `${Number(stats.prescriptionApprovalRate).toFixed(1)}%` : '0%',
      icon: <MedicineBoxOutlined />,
      color: '#13c2c2',
      change: '+1.2%',
      changeType: 'positive'
    }
  ]

  const medicineColumns = [
    { title: '药品名称', dataIndex: 'name', key: 'name' },
    { title: '规格', dataIndex: 'specification', key: 'specification' },
    { title: '销量', dataIndex: 'salesCount', key: 'salesCount', sorter: (a, b) => a.salesCount - b.salesCount }
  ]

  const getTrendTag = (trend) => {
    const map = {
      rising: { text: '上升趋势', color: 'red' },
      falling: { text: '下降趋势', color: 'green' },
      stable: { text: '趋势稳定', color: 'blue' }
    }
    const info = map[trend] || { text: trend || '未知', color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const getSeverityTag = (severity) => {
    const map = {
      high: { text: '高风险', color: 'red' },
      medium: { text: '中风险', color: 'orange' },
      low: { text: '低风险', color: 'blue' }
    }
    const info = map[severity] || { text: severity || '未知', color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">数据看板</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Select
            placeholder="选择城市"
            style={{ width: 150 }}
            allowClear
            value={city}
            onChange={handleCityChange}
          >
            <Option value="shenzhen">深圳市</Option>
            <Option value="guangzhou">广州市</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            ranges={{
              '今天': [dayjs(), dayjs()],
              '本周': [dayjs().startOf('week'), dayjs().endOf('week')],
              '本月': [dayjs().startOf('month'), dayjs().endOf('month')]
            }}
          />
          {(city || dateRange) && (
            <a onClick={handleClearFilter} style={{ whiteSpace: 'nowrap' }}>清除筛选</a>
          )}
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} md={8} lg={4} xl={4} key={index}>
            <Card className="stat-card" loading={loading}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-label">{card.title}</div>
                  <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                  <div className={`stat-change ${card.changeType}`}>
                    {card.changeType === 'positive' ? <RiseOutlined /> : <FallOutlined />}
                    {' '}{card.change} 较昨日
                  </div>
                </div>
                <div style={{ fontSize: 36, color: card.color, opacity: 0.3 }}>
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
              {salesTrend.length > 0 ? (
                <ReactECharts option={salesChartOption} style={{ height: '100%' }} />
              ) : (
                <Empty description="暂无销售趋势数据" />
              )}
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
            {topMedicines.length > 0 ? (
              <Table
                dataSource={topMedicines}
                columns={medicineColumns}
                pagination={false}
                size="small"
                rowKey="_id"
              />
            ) : (
              <Empty description="暂无热销数据" />
            )}
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
            {stockWarnings.length > 0 ? (
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
            ) : (
              <Empty description="暂无库存预警" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
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
                      description={`${item.patientName || ''} - ${new Date(item.createdAt).toLocaleDateString()}`}
                    />
                    <Tag color="orange">待审核</Tag>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无待审核处方" />
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
            {prediction.hotCategories?.length > 0 ? (
              <List
                size="small"
                dataSource={prediction.hotCategories}
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
            ) : (
              <Empty description="暂无预测数据" />
            )}
          </Card>
        </Col>
      </Row>

      <Card 
        style={{ marginBottom: 16 }}
        className="dashboard-card"
      >
        <Alert 
          message="流行病趋势提醒" 
          type="warning" 
          showIcon 
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
          description={
            epidemicTrend.recommendations?.length > 0
              ? epidemicTrend.recommendations.map((r, i) => (
                  <div key={i} style={{ marginTop: i > 0 ? 4 : 0 }}>{i + 1}. {r}</div>
                ))
              : '暂无流行病趋势预警'
          }
        />
        {(epidemicTrend.diseases || []).length > 0 ? (
          <Row gutter={[16, 16]}>
            {epidemicTrend.diseases.map((disease, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={index}>
                <Card 
                  size="small" 
                  style={{ 
                    borderLeft: `3px solid ${
                      disease.severity === 'high' ? '#ff4d4f' : 
                      disease.severity === 'medium' ? '#faad14' : '#1677ff'
                    }` 
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{disease.name}</div>
                  <div style={{ marginBottom: 8 }}>
                    {getTrendTag(disease.trend)}
                    {getSeverityTag(disease.severity)}
                  </div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                    📍 影响地区：{disease.affectedArea || '暂无数据'}
                  </div>
                  {(disease.suggestions || []).length > 0 && (
                    <div style={{ fontSize: 12, color: '#595959' }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>应对建议：</div>
                      {disease.suggestions.map((s, i) => (
                        <div key={i} style={{ paddingLeft: 8 }}>• {s}</div>
                      ))}
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="当前暂无流行病趋势数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </div>
  )
}

export default Dashboard
