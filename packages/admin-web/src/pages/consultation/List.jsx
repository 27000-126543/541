import { useState } from 'react'
import { Table, Button, Input, Select, Space, Tag, Avatar, Modal } from 'antd'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select

const ConsultationList = () => {
  const [data, setData] = useState([
    { _id: '1', consultationNo: 'CS202406150001', userName: '用户张三', doctorName: '张医生', department: '内科', type: 'text', status: 'completed', price: 30, createdAt: dayjs().subtract(2, 'hour').toISOString() },
    { _id: '2', consultationNo: 'CS202406150002', userName: '用户李四', doctorName: '李医生', department: '儿科', type: 'video', status: 'in_progress', price: 50, createdAt: dayjs().subtract(1, 'hour').toISOString() },
    { _id: '3', consultationNo: 'CS202406150003', userName: '用户王五', doctorName: '王医生', department: '皮肤科', type: 'text', status: 'pending', price: 20, createdAt: dayjs().subtract(30, 'minute').toISOString() },
    { _id: '4', consultationNo: 'CS202406140001', userName: '用户赵六', doctorName: '陈医生', department: '妇科', type: 'phone', status: 'completed', price: 45, createdAt: dayjs().subtract(1, 'day').toISOString() },
  ])
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)

  const getStatusTag = (status) => {
    const map = {
      pending: { text: '待接诊', color: 'orange' },
      in_progress: { text: '进行中', color: 'processing' },
      completed: { text: '已完成', color: 'green' },
      cancelled: { text: '已取消', color: 'default' }
    }
    const info = map[status] || { text: status, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const getTypeTag = (type) => {
    const map = {
      text: { text: '图文', color: 'blue' },
      video: { text: '视频', color: 'purple' },
      phone: { text: '电话', color: 'green' }
    }
    const info = map[type] || { text: type, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const viewDetail = (record) => {
    setCurrentRecord(record)
    setDetailVisible(true)
  }

  const columns = [
    {
      title: '咨询编号',
      dataIndex: 'consultationNo',
      key: 'consultationNo',
      width: 180
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName'
    },
    {
      title: '医生',
      dataIndex: 'doctorName',
      key: 'doctorName'
    },
    {
      title: '科室',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: '咨询类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => getTypeTag(type)
    },
    {
      title: '费用',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="price">¥{price}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: '发起时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => viewDetail(record)}>
            查看
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">问诊记录</h2>
      </div>

      <div className="table-container">
        <div className="filter-bar">
          <Input
            placeholder="搜索咨询编号/用户/医生"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
          <Select placeholder="状态" style={{ width: 150 }} allowClear>
            <Option value="pending">待接诊</Option>
            <Option value="in_progress">进行中</Option>
            <Option value="completed">已完成</Option>
            <Option value="cancelled">已取消</Option>
          </Select>
          <Select placeholder="类型" style={{ width: 130 }} allowClear>
            <Option value="text">图文咨询</Option>
            <Option value="video">视频问诊</Option>
            <Option value="phone">电话问诊</Option>
          </Select>
          <Button type="primary">搜索</Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title="咨询详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[<Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>]}
        width={600}
      >
        {currentRecord && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{currentRecord.consultationNo}</div>
                <div style={{ color: '#999', fontSize: 12 }}>
                  {dayjs(currentRecord.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </div>
              </div>
              {getStatusTag(currentRecord.status)}
            </div>

            <div style={{ display: 'flex', gap: 40, marginBottom: 16 }}>
              <div>
                <div style={{ color: '#999', fontSize: 12 }}>用户</div>
                <div style={{ fontWeight: 500 }}>{currentRecord.userName}</div>
              </div>
              <div>
                <div style={{ color: '#999', fontSize: 12 }}>医生</div>
                <div style={{ fontWeight: 500 }}>{currentRecord.doctorName}</div>
              </div>
              <div>
                <div style={{ color: '#999', fontSize: 12 }}>科室</div>
                <div>{currentRecord.department}</div>
              </div>
              <div>
                <div style={{ color: '#999', fontSize: 12 }}>类型</div>
                {getTypeTag(currentRecord.type)}
              </div>
            </div>

            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>费用</div>
              <div className="price" style={{ fontSize: 24 }}>¥{currentRecord.price}</div>
            </div>

            <div>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>症状描述</div>
              <div style={{ color: '#666' }}>
                患者自述最近三天有发烧、咳嗽症状，体温最高38.5℃，伴有喉咙痛、头痛。
                无呼吸困难，无药物过敏史。
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ConsultationList
