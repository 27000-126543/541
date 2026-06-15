import { useState } from 'react'
import { Table, Button, Input, Select, Space, Tag, Modal, Form, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select

const AdminList = () => {
  const [data, setData] = useState([
    { _id: '1', username: 'admin', realName: '系统管理员', role: 'super_admin', status: 'active', lastLogin: '2024-06-15 09:30:00', createdAt: '2023-01-01' },
    { _id: '2', username: 'pharmacist1', realName: '张药师', role: 'pharmacist', status: 'active', lastLogin: '2024-06-15 10:15:00', createdAt: '2023-06-01' },
    { _id: '3', username: 'store1', realName: '李店长', role: 'store_manager', status: 'active', lastLogin: '2024-06-14 18:20:00', createdAt: '2023-03-15' },
  ])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentId, setCurrentId] = useState(null)
  const [form] = Form.useForm()

  const getRoleTag = (role) => {
    const map = {
      super_admin: { text: '超级管理员', color: 'red' },
      pharmacist: { text: '药剂师', color: 'blue' },
      store_manager: { text: '门店管理员', color: 'green' },
      finance: { text: '财务', color: 'orange' },
      customer_service: { text: '客服', color: 'purple' }
    }
    const info = map[role] || { text: role, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const getStatusTag = (status) => {
    const map = {
      active: { text: '启用', color: 'green' },
      disabled: { text: '禁用', color: 'red' }
    }
    const info = map[status] || { text: status, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const handleAdd = () => {
    setIsEdit(false)
    setCurrentId(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (record) => {
    setIsEdit(true)
    setCurrentId(record._id)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该管理员吗？',
      onOk: () => {
        setData(data.filter(item => item._id !== id))
        message.success('删除成功')
      }
    })
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (isEdit) {
        setData(data.map(item => 
          item._id === currentId ? { ...item, ...values } : item
        ))
        message.success('更新成功')
      } else {
        const newItem = { ...values, _id: String(Date.now()), createdAt: new Date().toISOString() }
        setData([...data, newItem])
        message.success('创建成功')
      }
      setIsModalVisible(false)
    } catch (e) {
      console.error(e)
    }
  }

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getRoleTag(role)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: '最近登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.role !== 'super_admin' && (
            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)}>
              删除
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">管理员管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加管理员
        </Button>
      </div>

      <div className="table-container">
        <div className="filter-bar">
          <Input
            placeholder="搜索用户名/真实姓名"
            style={{ width: 250 }}
          />
          <Select placeholder="角色" style={{ width: 150 }} allowClear>
            <Option value="super_admin">超级管理员</Option>
            <Option value="pharmacist">药剂师</Option>
            <Option value="store_manager">门店管理员</Option>
            <Option value="finance">财务</Option>
            <Option value="customer_service">客服</Option>
          </Select>
          <Select placeholder="状态" style={{ width: 150 }} allowClear>
            <Option value="active">启用</Option>
            <Option value="disabled">禁用</Option>
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
        title={isEdit ? '编辑管理员' : '添加管理员'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>取消</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            确定
          </Button>
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="真实姓名"
            name="realName"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input placeholder="请输入真实姓名" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={isEdit ? [] : [{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder={isEdit ? '不修改请留空' : '请输入密码'} />
          </Form.Item>
          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Option value="super_admin">超级管理员</Option>
              <Option value="pharmacist">药剂师</Option>
              <Option value="store_manager">门店管理员</Option>
              <Option value="finance">财务</Option>
              <Option value="customer_service">客服</Option>
            </Select>
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select>
              <Option value="active">启用</Option>
              <Option value="disabled">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminList
