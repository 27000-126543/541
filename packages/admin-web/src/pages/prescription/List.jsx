import { useState, useEffect } from 'react'
import { Table, Button, Input, Select, Space, Tag, Modal, Descriptions, message, Card } from 'antd'
import { SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined, WarningOutlined } from '@ant-design/icons'
import { prescriptionApi } from '../../services/api'
import dayjs from 'dayjs'

const { Option } = Select

const PrescriptionList = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState('pending')
  const [detailModal, setDetailModal] = useState(false)
  const [currentPrescription, setCurrentPrescription] = useState(null)
  const [reviewModal, setReviewModal] = useState(false)
  const [reviewResult, setReviewResult] = useState('')
  const [reviewRemark, setReviewRemark] = useState('')
  const [interactionWarnings, setInteractionWarnings] = useState([])

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize, status])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        status,
        keyword: searchText
      }
      const res = await prescriptionApi.getList(params)
      if (res.code === 0) {
        setData(res.data.list)
        setTotal(res.data.total)
      }
    } catch (e) {
      console.error('加载处方列表失败', e)
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { text: '待审核', color: 'orange' },
      reviewing: { text: '审核中', color: 'processing' },
      approved: { text: '已通过', color: 'green' },
      rejected: { text: '已拒绝', color: 'red' },
      expired: { text: '已过期', color: 'default' }
    }
    const info = statusMap[status] || { text: status, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const getTypeTag = (type) => {
    return type === 'online' ? <Tag color="blue">在线开方</Tag> : <Tag color="purple">上传处方</Tag>
  }

  const viewDetail = async (id) => {
    try {
      const res = await prescriptionApi.getDetail(id)
      if (res.code === 0) {
        setCurrentPrescription(res.data)
        setDetailModal(true)
      }
    } catch (e) {
      console.error('加载处方详情失败', e)
    }
  }

  const handleReview = (record) => {
    setCurrentPrescription(record)
    setReviewResult('approve')
    setReviewRemark('')
    setInteractionWarnings([])
    setReviewModal(true)
  }

  const submitReview = async () => {
    if (!reviewResult) {
      message.warning('请选择审核结果')
      return
    }

    try {
      const res = await prescriptionApi.review(currentPrescription._id, {
        action: reviewResult,
        remark: reviewRemark
      })
      if (res.code === 0) {
        message.success('审核完成')
        setReviewModal(false)
        loadData()
      }
    } catch (e) {
      if (e.code === 1001) {
        setInteractionWarnings(e.message ? [e.message] : [])
      }
    }
  }

  const columns = [
    {
      title: '处方编号',
      dataIndex: 'prescriptionNo',
      key: 'prescriptionNo',
      width: 180,
      render: (text) => <a>{text}</a>
    },
    {
      title: '处方类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => getTypeTag(type)
    },
    {
      title: '患者姓名',
      dataIndex: 'patientName',
      key: 'patientName',
      width: 100
    },
    {
      title: '患者信息',
      key: 'patientInfo',
      render: (_, record) => (
        <div>
          <div>{record.patientGender === 'male' ? '男' : '女'}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.patientAge}岁</div>
        </div>
      )
    },
    {
      title: '诊断',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      ellipsis: true
    },
    {
      title: '药品数量',
      key: 'medicineCount',
      render: (_, record) => record.medicines?.length || 0
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => viewDetail(record._id)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button 
                type="link" 
                icon={<CheckOutlined />} 
                onClick={() => handleReview(record)}
              >
                审核
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  const statusTabs = [
    { key: 'pending', label: '待审核', color: 'orange' },
    { key: 'reviewing', label: '审核中', color: 'processing' },
    { key: 'approved', label: '已通过', color: 'green' },
    { key: 'rejected', label: '已拒绝', color: 'red' },
    { key: 'all', label: '全部', color: 'default' }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">处方审核</h2>
      </div>

      <div className="table-container">
        <div className="filter-bar">
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {statusTabs.map(tab => (
              <Button
                key={tab.key}
                type={status === tab.key ? 'primary' : 'default'}
                onClick={() => {
                  setStatus(tab.key)
                  setPagination({ ...pagination, current: 1 })
                }}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="filter-bar">
          <Input
            placeholder="搜索处方编号/患者姓名"
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
          <Button type="primary" onClick={() => {
            setPagination({ ...pagination, current: 1 })
            loadData()
          }}>搜索</Button>
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
        title="处方详情"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>关闭</Button>,
          currentPrescription?.status === 'pending' && (
            <Button key="review" type="primary" onClick={() => {
              setDetailModal(false)
              handleReview(currentPrescription)
            }}>
              去审核
            </Button>
          )
        ]}
        width={700}
      >
        {currentPrescription && (
          <div>
            <Descriptions title="基本信息" column={2} bordered size="small">
              <Descriptions.Item label="处方编号">{currentPrescription.prescriptionNo}</Descriptions.Item>
              <Descriptions.Item label="处方类型">{getTypeTag(currentPrescription.type)}</Descriptions.Item>
              <Descriptions.Item label="患者姓名">{currentPrescription.patientName}</Descriptions.Item>
              <Descriptions.Item label="患者年龄">{currentPrescription.patientAge}岁</Descriptions.Item>
              <Descriptions.Item label="患者性别">{currentPrescription.patientGender === 'male' ? '男' : '女'}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(currentPrescription.status)}</Descriptions.Item>
              <Descriptions.Item label="提交时间" span={2}>
                {dayjs(currentPrescription.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            {currentPrescription.diagnosis && (
              <Card title="诊断信息" size="small" style={{ marginTop: 16 }}>
                {currentPrescription.diagnosis}
              </Card>
            )}

            {currentPrescription.symptoms && (
              <Card title="症状描述" size="small" style={{ marginTop: 16 }}>
                {currentPrescription.symptoms}
              </Card>
            )}

            <Card title="处方药品" size="small" style={{ marginTop: 16 }}>
              {currentPrescription.medicines?.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: index < currentPrescription.medicines.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.medicineName}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{item.specification}</div>
                    {item.dosage && <div style={{ fontSize: 12, color: '#666' }}>用法：{item.dosage}</div>}
                    {item.frequency && <div style={{ fontSize: 12, color: '#666' }}>频次：{item.frequency}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>x{item.quantity}</div>
                    {item.days && <div style={{ fontSize: 12, color: '#999' }}>{item.days}天用量</div>}
                  </div>
                </div>
              ))}
            </Card>

            {currentPrescription.uploadedImages?.length > 0 && (
              <Card title="处方图片" size="small" style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {currentPrescription.uploadedImages.map((img, index) => (
                    <div key={index} style={{
                      width: 150,
                      height: 200,
                      background: '#f5f5f5',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 48
                    }}>
                      📄
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {currentPrescription.status === 'approved' && (
              <Card title="审核信息" size="small" style={{ marginTop: 16 }}>
                <div>审核药师：{currentPrescription.pharmacistName}</div>
                <div>审核时间：{dayjs(currentPrescription.reviewedAt).format('YYYY-MM-DD HH:mm:ss')}</div>
                {currentPrescription.reviewRemark && <div>审核备注：{currentPrescription.reviewRemark}</div>}
              </Card>
            )}

            {currentPrescription.status === 'rejected' && (
              <Card title="审核信息" size="small" style={{ marginTop: 16 }}>
                <div>审核药师：{currentPrescription.pharmacistName}</div>
                <div>审核时间：{dayjs(currentPrescription.reviewedAt).format('YYYY-MM-DD HH:mm:ss')}</div>
                <div>拒绝原因：{currentPrescription.rejectedReason}</div>
              </Card>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="处方审核"
        open={reviewModal}
        onCancel={() => setReviewModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setReviewModal(false)}>取消</Button>,
          <Button key="submit" type="primary" onClick={submitReview}>提交审核</Button>
        ]}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>处方编号：{currentPrescription?.prescriptionNo}</div>
          <div>患者姓名：{currentPrescription?.patientName}</div>
        </div>

        {interactionWarnings.length > 0 && (
          <div style={{
            background: '#fffbe6',
            border: '1px solid #ffe58f',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16
          }}>
            <div style={{ color: '#faad14', fontWeight: 500, marginBottom: 8 }}>
              <WarningOutlined style={{ marginRight: 8 }} />
              药物相互作用预警
            </div>
            {interactionWarnings.map((warning, index) => (
              <div key={index} style={{ fontSize: 12, color: '#666' }}>
                • {warning}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>审核结果</div>
          <Select
            value={reviewResult}
            onChange={setReviewResult}
            style={{ width: 200 }}
          >
            <Option value="approve">通过</Option>
            <Option value="reject">拒绝</Option>
          </Select>
        </div>

        <div>
          <div style={{ marginBottom: 8 }}>审核备注</div>
          <Input.TextArea
            rows={4}
            value={reviewRemark}
            onChange={e => setReviewRemark(e.target.value)}
            placeholder={reviewResult === 'reject' ? '请输入拒绝原因' : '请输入备注信息（可选）'}
          />
        </div>
      </Modal>
    </div>
  )
}

export default PrescriptionList
