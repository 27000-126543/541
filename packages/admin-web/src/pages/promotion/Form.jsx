import { useState } from 'react'
import { Card, Form, Input, Select, Button, Space, Tabs, InputNumber, DatePicker, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs
const { RangePicker } = DatePicker

const PromotionForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [type, setType] = useState('full_reduction')
  const isEdit = !!id

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      message.success(isEdit ? '更新成功' : '创建成功')
      navigate('/promotion')
    } catch (e) {
      console.error('提交失败', e)
    }
  }

  return (
    <div>
      <div className="page-header">
        <Space size="middle">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <h2 className="page-title">{isEdit ? '编辑活动' : '新建活动'}</h2>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'full_reduction',
          status: 'draft'
        }}
      >
        <Card className="form-section">
          <div className="form-section-title">基本信息</div>
          
          <div style={{ display: 'flex', gap: 20 }}>
            <Form.Item
              label="活动名称"
              name="name"
              rules={[{ required: true, message: '请输入活动名称' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入活动名称" />
            </Form.Item>
            <Form.Item
              label="活动类型"
              name="type"
              rules={[{ required: true, message: '请选择活动类型' }]}
              style={{ width: 200 }}
            >
              <Select onChange={setType}>
                <Option value="full_reduction">满减活动</Option>
                <Option value="flash_sale">限时秒杀</Option>
                <Option value="group_buy">拼团活动</Option>
                <Option value="discount">折扣活动</Option>
                <Option value="coupon">优惠券</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="活动描述" name="description">
            <TextArea rows={3} placeholder="请输入活动描述" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 20 }}>
            <Form.Item
              label="活动时间"
              name="timeRange"
              rules={[{ required: true, message: '请选择活动时间' }]}
              style={{ flex: 1 }}
            >
              <RangePicker
                showTime
                style={{ width: '100%' }}
                format="YYYY-MM-DD HH:mm"
              />
            </Form.Item>
            <Form.Item
              label="活动状态"
              name="status"
              style={{ width: 150 }}
            >
              <Select>
                <Option value="draft">草稿</Option>
                <Option value="active">立即生效</Option>
              </Select>
            </Form.Item>
          </div>
        </Card>

        <Card className="form-section">
          <div className="form-section-title">活动规则</div>
          
          {type === 'full_reduction' && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>满减档位</div>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                    <span style={{ lineHeight: '32px', width: 80 }}>第{i + 1}档：</span>
                    <InputNumber
                      placeholder="满多少元"
                      prefix="满"
                      style={{ width: 150 }}
                    />
                    <InputNumber
                      placeholder="减多少元"
                      prefix="减"
                      style={{ width: 150 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {type === 'discount' && (
            <div>
              <Form.Item
                label="折扣率"
                name="discountRate"
              >
                <InputNumber
                  min={0.1}
                  max={0.99}
                  step={0.01}
                  precision={2}
                  style={{ width: 200 }}
                  addonAfter="折"
                />
              </Form.Item>
            </div>
          )}

          {type === 'flash_sale' && (
            <div style={{ display: 'flex', gap: 20 }}>
              <Form.Item
                label="折扣率"
                name="flashDiscount"
              >
                <InputNumber
                  min={0.1}
                  max={0.99}
                  step={0.01}
                  precision={2}
                  style={{ width: 150 }}
                  addonAfter="折"
                />
              </Form.Item>
              <Form.Item
                label="每人限购"
                name="limitPerUser"
              >
                <InputNumber
                  min={1}
                  style={{ width: 150 }}
                  addonAfter="件"
                />
              </Form.Item>
            </div>
          )}

          {type === 'group_buy' && (
            <div style={{ display: 'flex', gap: 20 }}>
              <Form.Item
                label="成团人数"
                name="groupSize"
              >
                <InputNumber
                  min={2}
                  style={{ width: 150 }}
                  addonAfter="人"
                />
              </Form.Item>
              <Form.Item
                label="折扣率"
                name="groupDiscount"
              >
                <InputNumber
                  min={0.1}
                  max={0.99}
                  step={0.01}
                  precision={2}
                  style={{ width: 150 }}
                  addonAfter="折"
                />
              </Form.Item>
            </div>
          )}

          <div style={{ display: 'flex', gap: 20 }}>
            <Form.Item label="最低消费金额" name="minOrderAmount" style={{ width: 200 }}>
              <InputNumber prefix="¥" min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="最高优惠金额" name="maxDiscount" style={{ width: 200 }}>
              <InputNumber prefix="¥" min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </Card>

        <Card className="form-section">
          <div className="form-section-title">适用范围</div>
          <Form.Item label="适用商品">
            <Select defaultValue="all">
              <Option value="all">全部商品</Option>
              <Option value="categories">指定分类</Option>
              <Option value="medicines">指定药品</Option>
            </Select>
          </Form.Item>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Space size="large">
            <Button onClick={() => navigate(-1)}>取消</Button>
            <Button type="primary" htmlType="submit">
              {isEdit ? '保存修改' : '创建活动'}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  )
}

export default PromotionForm
