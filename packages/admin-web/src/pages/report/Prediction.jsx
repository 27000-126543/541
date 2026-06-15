import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, List, Tag, Alert, Progress, Space, Button, Select } from 'antd'
import { 
  RiseOutlined, 
  BulbOutlined, 
  WarningOutlined, 
  ShoppingCartOutlined,
  StockOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { statsApi } from '../../services/api'

const { Option } = Select

const Prediction = () => {
  const [quarter, setQuarter] = useState('next')
  const [prediction, setPrediction] = useState({
    hotCategories: [],
    demandPeaks: [],
    suggestions: [],
    overallGrowth: 0
  })
  const [epidemicTrend, setEpidemicTrend] = useState({ diseases: [], recommendations: [] })

  useEffect(() => {
    loadPrediction()
    loadEpidemicTrend()
  }, [quarter])

  const loadPrediction = async () => {
    try {
      const res = await statsApi.getPrediction({ quarter })
      if (res.code === 0) {
        setPrediction(res.data)
      }
    } catch (e) {
      console.error('加载预测数据失败', e)
      const mockData = {
        hotCategories: [
          { category: '感冒用药', predictedGrowth: 15, reason: '季节变化，感冒高发期' },
          { category: '消化系统', predictedGrowth: 8, reason: '夏季肠胃疾病增多' },
          { category: '皮肤用药', predictedGrowth: 12, reason: '夏季皮肤病高发' },
          { category: '维生素保健', predictedGrowth: 20, reason: '健康意识提升' },
          { category: '防暑降温', predictedGrowth: 25, reason: '夏季高温天气' }
        ],
        demandPeaks: [
          { date: '2026-07-15', type: '感冒用药', reason: '暑期流感高峰', expectedGrowth: 30 },
          { date: '2026-08-01', type: '防暑药品', reason: '高温天气', expectedGrowth: 45 },
          { date: '2026-09-10', type: '肠胃用药', reason: '秋季腹泻', expectedGrowth: 20 }
        ],
        suggestions: [
          { type: 'inventory', content: '建议增加感冒类药品库存30%，应对暑期流感高峰', priority: 'high' },
          { type: 'inventory', content: '防暑降温药品库存增加50%，备战高温天气', priority: 'high' },
          { type: 'promotion', content: '推出夏季养生保健品促销活动，提升保健品销量', priority: 'medium' },
          { type: 'promotion', content: '维生素类产品组合销售，提高客单价', priority: 'medium' },
          { type: 'staff', content: '增加门店值班药师排班，应对购药高峰', priority: 'low' }
        ],
        overallGrowth: 15
      }
      setPrediction(mockData)
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
      const mockData = {
        diseases: [
          { name: '流行性感冒', trend: 'rising', severity: 'medium', affectedArea: '全国大部分地区' },
          { name: '急性肠胃炎', trend: 'rising', severity: 'high', affectedArea: '南方地区' },
          { name: '过敏性鼻炎', trend: 'stable', severity: 'medium', affectedArea: '北方地区' },
          { name: '中暑', trend: 'rising', severity: 'high', affectedArea: '全国高温地区' },
          { name: '皮肤过敏', trend: 'rising', severity: 'low', affectedArea: '沿海地区' }
        ],
        recommendations: [
          '建议储备充足的感冒类、退烧类药品',
          '胃肠道药品需求将增加，注意库存管理',
          '防暑药品需求大幅上升，重点备货'
        ]
      }
      setEpidemicTrend(mockData)
    }
  }

  const growthChartOption = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: prediction.hotCategories.map(item => item.category)
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '+{value}%'
      }
    },
    series: [
      {
        name: '预计增长率',
        type: 'bar',
        data: prediction.hotCategories.map(item => item.predictedGrowth),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' }
            ]
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '+{c}%'
        }
      }
    ]
  }

  const getPriorityTag = (priority) => {
    const map = { high: 'red', medium: 'orange', low: 'blue' }
    const textMap = { high: '高优先级', medium: '中优先级', low: '低优先级' }
    return <Tag color={map[priority]}>{textMap[priority]}</Tag>
  }

  const getTrendTag = (trend) => {
    const map = { rising: 'red', falling: 'green', stable: 'default' }
    const textMap = { rising: '上升', falling: '下降', stable: '稳定' }
    return <Tag color={map[trend]}>{textMap[trend]}</Tag>
  }

  const getSeverityTag = (severity) => {
    const map = { high: 'red', medium: 'orange', low: 'blue' }
    const textMap = { high: '高', medium: '中', low: '低' }
    return <Tag color={map[severity]}>{textMap[severity]}</Tag>
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">智能预测</h2>
        <Space>
          <Select value={quarter} onChange={setQuarter} style={{ width: 200 }}>
            <Option value="next">下一季度</Option>
            <Option value="current">本季度</Option>
            <Option value="next_year">明年</Option>
          </Select>
          <Button type="primary">生成预测报告</Button>
        </Space>
      </div>

      <Alert
        message="基于历史数据和流行病趋势，系统自动预测下一季度热销品类及需求高峰，建议调整库存和促销策略"
        type="info"
        showIcon
        icon={<BulbOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="整体销售增长预测"
              value={prediction.overallGrowth}
              precision={0}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="热销品类数"
              value={prediction.hotCategories.length}
              suffix="个"
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="需求高峰点"
              value={prediction.demandPeaks.length}
              suffix="个"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="优化建议"
              value={prediction.suggestions.length}
              suffix="条"
              prefix={<StockOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="热销品类增长率预测" className="dashboard-card">
            <div className="chart-container" style={{ height: 350 }}>
              <ReactECharts option={growthChartOption} style={{ height: '100%' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="需求高峰预测" className="dashboard-card">
            <List
              dataSource={prediction.demandPeaks}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.type}
                    description={
                      <div>
                        <div style={{ color: '#999', fontSize: 12 }}>{item.date}</div>
                        <div>{item.reason}</div>
                      </div>
                    }
                  />
                  <Tag color="red">+{item.expectedGrowth}%</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                流行病趋势提醒
              </span>
            } 
            className="dashboard-card"
          >
            {epidemicTrend.diseases.map((disease, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: index < epidemicTrend.diseases.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{disease.name}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{disease.affectedArea}</div>
                </div>
                <Space>
                  {getTrendTag(disease.trend)}
                  {getSeverityTag(disease.severity)}
                </Space>
              </div>
            ))}

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>应对建议</div>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#666' }}>
                {epidemicTrend.recommendations?.map((rec, index) => (
                  <li key={index} style={{ marginBottom: 4 }}>{rec}</li>
                ))}
              </ul>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <BulbOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                智能优化建议
              </span>
            } 
            className="dashboard-card"
          >
            <List
              dataSource={prediction.suggestions}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: item.type === 'inventory' ? '#e6f4ff' : 
                                   item.type === 'promotion' ? '#fff7e6' : '#f6ffed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20
                      }}>
                        {item.type === 'inventory' ? '📦' : item.type === 'promotion' ? '🏷️' : '👥'}
                      </div>
                    }
                    title={getPriorityTag(item.priority)}
                    description={item.content}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Prediction
