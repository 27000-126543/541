import { useState, useEffect } from 'react'
import { Table, Button, Input, Select, Space, Tag, Avatar, Modal } from 'antd'
import { SearchOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons'
import { userApi } from '../../services/api'
import dayjs from 'dayjs'

const { Option } = Select

const UserList = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [searchText, setSearchText] = useState('')
  const [memberLevel, setMemberLevel] = useState('')
  const [detailModal, setDetailModal] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const mockData = Array.from({ length: 20 }, (_, i) => ({
        _id: `user_${i + 1}`,
        phone: `13800${String(i + 1).padStart(6, '0')}`,
        nickname: `用户${i + 1}`,
        avatar: '',
        gender: i % 2 === 0 ? 'male' : 'female',
        memberLevel: ['normal', 'silver', 'gold', 'diamond'][i % 4],
        memberPoints: Math.floor(Math.random() * 5000),
        yearlyConsumption: Math.floor(Math.random() * 20000),
        isRealNameVerified: i % 3 === 0,
        status: i === 5 ? 'disabled' : 'active',
        createdAt: dayjs().subtract(i, 'day').toISOString()
      }))
      
      setData(mockData.slice(0, pagination.pageSize))
      setTotal(200)
    } catch (e) {
      console.error('加载用户列表失败', e)
    } finally {
      setLoading(false)
    }
  }

  const getMemberLevelTag = (level) => {
    const levelMap = {
      normal: { text: '普通会员', color: 'default' },
      silver: { text: '银卡会员', color: 'grey' },
      gold: { text: '金卡会员', color: 'gold' },
      diamond: { text: '钻石会员', color: 'blue' }
    }
    const info = levelMap[level] || { text: level, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const viewDetail = async (id) => {
    setCurrentUser(data.find(u => u._id === id))
    setDetailModal(true)
  }

  const toggleStatus = (record) => {
    Modal.confirm({
      title: record.status === 'active' ? '确定要禁用该用户吗？' : '确定要启用该用户吗？',
      onOk: () => {
        message.success('操作成功')
        loadData()
      }
    })
  }

  const columns = [
    {
      title: '用户信息',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <div>
            <div>{text}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.phone}</div>
          </div>
        </div>
      )
    },
    {
      title: '会员等级',
      dataIndex: 'memberLevel',
      key: 'memberLevel',
      render: (level) => getMemberLevelTag(level)
    },
    {
      title: '积分',
      dataIndex: 'memberPoints',
      key: 'memberPoints'
    },
    {
      title: '年消费',
      dataIndex: 'yearlyConsumption',
      key: 'yearlyConsumption',
      render: (amount) => <span className="price">¥{amount.toFixed(2)}</span>
    },
    {
      title: '实名认证',
      dataIndex: 'isRealNameVerified',
      key: 'isRealNameVerified',
      render: (verified) => (
        <Tag color={verified ? 'green' : 'default'}>
          {verified ? '已认证' : '未认证'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '禁用'}
        </Tag>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => viewDetail(record._id)}>
            详情
          </Button>
          <Button type="link" danger onClick={() => toggleStatus(record)}>
            {record.status === 'active' ? '禁用' : '启用'}
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">用户列表</h2>
      </div>

      <div className="table-container">
        <div className="filter-bar">
          <Input
            placeholder="搜索手机号/昵称"
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
            placeholder="会员等级"
            style={{ width: 150 }}
            allowClear
            value={memberLevel}
            onChange={value => {
              setMemberLevel(value)
              setPagination({ ...pagination, current: 1 })
              setTimeout(loadData, 0)
            }}
          >
            <Option value="normal">普通会员</Option>
            <Option value="silver">银卡会员</Option>
            <Option value="gold">金卡会员</Option>
            <Option value="diamond">钻石会员</Option>
          </Select>
          <Button type="primary" onClick={() => {
            setPagination({ ...pagination, current: 1 })
            loadData()
          }}>搜索</Button>
          <Button onClick={() => {
            setSearchText('')
            setMemberLevel('')
            loadData()
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
        title="用户详情"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[<Button key="close" onClick={() => setDetailModal(false)}>关闭</Button>]}
        width={600}
      >
        {currentUser && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <Avatar size={64} icon={<UserOutlined />} src={currentUser.avatar} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{currentUser.nickname}</div>
                <div style={{ color: '#999' }}>{currentUser.phone}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1, background: '#f5f5f5', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#1677ff' }}>{currentUser.memberPoints}</div>
                <div style={{ fontSize: 12, color: '#999' }}>积分</div>
              </div>
              <div style={{ flex: 1, background: '#f5f5f5', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#ff4d4f' }}>¥{currentUser.yearlyConsumption}</div>
                <div style={{ fontSize: 12, color: '#999' }}>年消费</div>
              </div>
              <div style={{ flex: 1, background: '#f5f5f5', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                  {getMemberLevelTag(currentUser.memberLevel)}
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>会员等级</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default UserList
