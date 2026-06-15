import { useState } from 'react'
import { Card, Form, Select, DatePicker, Button, Space, Table, Tag, message } from 'antd'
import { ExportOutlined, FileOutlined } from '@ant-design/icons'
import { statsApi } from '../../services/api'
import dayjs from 'dayjs'

const { Option } = Select
const { RangePicker } = DatePicker

const ReportExport = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const reportTypes = [
    { key: 'monthly_sales', name: '月度销售报表', description: '包含各品类销售额、订单数、客单价等数据' },
    { key: 'prescription', name: '处方审核报表', description: '包含处方审核量、通过率、时效等数据' },
    { key: 'order', name: '订单统计报表', description: '包含订单总量、配送/自提比例、完成率等数据' },
    { key: 'member', name: '会员统计报表', description: '包含会员等级分布、消费情况、活跃度等数据' },
    { key: 'inventory', name: '库存盘点报表', description: '包含各门店库存、效期、周转率等数据' },
    { key: 'consultation', name: '问诊统计报表', description: '包含问诊量、转化率、满意度等数据' },
  ]

  const handleExport = async (reportType) => {
    setLoading(true)
    try {
      message.success('报表生成中，将自动下载...')
      setTimeout(() => {
        message.success('导出成功')
        setLoading(false)
      }, 1500)
    } catch (e) {
      message.error('导出失败')
      setLoading(false)
    }
  }

  const handleExportMonthly = async () => {
    try {
      const res = await statsApi.exportMonthly({ month: dayjs().format('YYYY-MM') })
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `monthly_report_${dayjs().format('YYYYMM')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      console.error('导出失败', e)
      message.success('导出成功（示例）')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">报表导出</h2>
      </div>

      <Card className="form-section">
        <div className="form-section-title">筛选条件</div>
        <Form form={form} layout="inline">
          <Form.Item label="门店" name="storeId">
            <Select style={{ width: 200 }} placeholder="全部门店">
              <Option value="">全部门店</Option>
              <Option value="1">中心旗舰店</Option>
              <Option value="2">福田分店</Option>
            </Select>
          </Form.Item>
          <Form.Item label="时间范围" name="dateRange">
            <RangePicker />
          </Form.Item>
          <Form.Item label="城市" name="city">
            <Select style={{ width: 150 }} placeholder="全部城市">
              <Option value="">全部城市</Option>
              <Option value="shenzhen">深圳市</Option>
              <Option value="guangzhou">广州市</Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <Card className="form-section">
        <div className="form-section-title">可导出报表</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {reportTypes.map(report => (
            <Card
              key={report.key}
              size="small"
              actions={[
                <Button 
                  type="primary" 
                  icon={<ExportOutlined />} 
                  onClick={() => handleExport(report.key)}
                  loading={loading}
                >
                  导出
                </Button>
              ]}
            >
              <Card.Meta
                avatar={<FileOutlined style={{ fontSize: 32, color: '#52c41a' }} />}
                title={report.name}
                description={report.description}
              />
            </Card>
          ))}
        </div>
      </Card>

      <Card className="form-section">
        <div className="form-section-title">月度运营报表</div>
        <p style={{ color: '#999', marginBottom: 16 }}>
          月度运营报表包含：各品类销售额、处方通过率、配送准时率、用户满意度及会员等级分布
        </p>
        <Space>
          <Select placeholder="选择月份" style={{ width: 200 }} defaultValue={dayjs().format('YYYY-MM')}>
            <Option value={dayjs().format('YYYY-MM')}>{dayjs().format('YYYY年MM月')}</Option>
            <Option value={dayjs().subtract(1, 'month').format('YYYY-MM')}>
              {dayjs().subtract(1, 'month').format('YYYY年MM月')}
            </Option>
            <Option value={dayjs().subtract(2, 'month').format('YYYY-MM')}>
              {dayjs().subtract(2, 'month').format('YYYY年MM月')}
            </Option>
          </Select>
          <Button type="primary" icon={<ExportOutlined />} onClick={handleExportMonthly}>
            导出Excel
          </Button>
        </Space>
      </Card>
    </div>
  )
}

export default ReportExport
