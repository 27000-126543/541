import { useState } from 'react'
import { Card, Form, Input, Button, Avatar, message, Upload, Divider } from 'antd'
import { UserOutlined, CameraOutlined } from '@ant-design/icons'
import { useAuth } from '../../context/AuthContext'

const Profile = () => {
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [avatar, setAvatar] = useState('')

  const handleProfileSubmit = async () => {
    try {
      const values = await form.validateFields()
      message.success('个人信息更新成功')
    } catch (e) {
      console.error(e)
    }
  }

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields()
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致')
        return
      }
      message.success('密码修改成功')
      passwordForm.resetFields()
    } catch (e) {
      console.error(e)
    }
  }

  const uploadProps = {
    showUploadList: false,
    beforeUpload: (file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatar(e.target.result)
      }
      reader.readAsDataURL(file)
      return false
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">个人设置</h2>
      </div>

      <div style={{ maxWidth: 700 }}>
        <Card className="form-section">
          <div className="form-section-title">基本信息</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
            <Upload {...uploadProps}>
              <div style={{ 
                position: 'relative',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}>
                {avatar ? (
                  <img src={avatar} style={{ width: 80, height: 80, borderRadius: '50%' }} />
                ) : (
                  <Avatar size={80} icon={<UserOutlined />} />
                )}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  fontSize: 12,
                  textAlign: 'center',
                  padding: '4px 0',
                  borderBottomLeftRadius: 40,
                  borderBottomRightRadius: 40
                }}>
                  <CameraOutlined /> 修改
                </div>
              </div>
            </Upload>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                {user?.username || 'admin'}
              </div>
              <div style={{ color: '#999' }}>{user?.role || '超级管理员'}</div>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleProfileSubmit}
            initialValues={{
              username: user?.username || 'admin',
              realName: user?.realName || '系统管理员',
              email: 'admin@example.com',
              phone: '138****8888'
            }}
          >
            <div style={{ display: 'flex', gap: 20 }}>
              <Form.Item
                label="用户名"
                name="username"
                style={{ flex: 1 }}
              >
                <Input disabled />
              </Form.Item>
              <Form.Item
                label="真实姓名"
                name="realName"
                style={{ flex: 1 }}
              >
                <Input />
              </Form.Item>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <Form.Item label="邮箱" name="email" style={{ flex: 1 }}>
                <Input />
              </Form.Item>
              <Form.Item label="手机号" name="phone" style={{ flex: 1 }}>
                <Input />
              </Form.Item>
            </div>
            <Form.Item label="所属门店">
              <Input value="中心旗舰店" disabled />
            </Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">保存修改</Button>
            </div>
          </Form>
        </Card>

        <Divider />

        <Card className="form-section">
          <div className="form-section-title">修改密码</div>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordSubmit}
            style={{ maxWidth: 400 }}
          >
            <Form.Item
              label="当前密码"
              name="oldPassword"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password placeholder="请输入当前密码" />
            </Form.Item>
            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6位' }
              ]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              rules={[{ required: true, message: '请确认新密码' }]}
            >
              <Input.Password placeholder="请再次输入新密码" />
            </Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">修改密码</Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  )
}

export default Profile
