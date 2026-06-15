import { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Select, Button, Card, Space, Upload, Switch, message, Tabs } from 'antd'
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { medicineApi } from '../../services/api'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

const MedicineForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState([])
  const isEdit = !!id

  useEffect(() => {
    loadCategories()
    if (isEdit) {
      loadDetail()
    }
  }, [id])

  const loadCategories = async () => {
    try {
      const res = await medicineApi.getCategories()
      if (res.code === 0) {
        setCategories(res.data)
      }
    } catch (e) {
      console.error('加载分类失败', e)
    }
  }

  const loadDetail = async () => {
    setLoading(true)
    try {
      const res = await medicineApi.getDetail(id)
      if (res.code === 0) {
        form.setFieldsValue(res.data)
      }
    } catch (e) {
      console.error('加载药品详情失败', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      if (isEdit) {
        await medicineApi.update(id, values)
        message.success('更新成功')
      } else {
        await medicineApi.create(values)
        message.success('创建成功')
      }
      navigate('/medicine')
    } catch (e) {
      console.error('保存失败', e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <Space size="middle">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <h2 className="page-title">{isEdit ? '编辑药品' : '新增药品'}</h2>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isOnSale: true,
          isHot: false,
          isNew: false,
          isRecommended: false,
          type: 'otc'
        }}
      >
        <Tabs defaultActiveKey="basic">
          <TabPane tab="基本信息" key="basic">
            <Card title="基础信息" className="form-section">
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label="药品名称"
                    name="name"
                    rules={[{ required: true, message: '请输入药品名称' }]}
                  >
                    <Input placeholder="请输入药品名称" />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label="通用名称"
                    name="genericName"
                  >
                    <Input placeholder="请输入通用名称" />
                  </Form.Item>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label="英文名称"
                    name="englishName"
                  >
                    <Input placeholder="请输入英文名称" />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label="品牌"
                    name="brand"
                  >
                    <Input placeholder="请输入品牌" />
                  </Form.Item>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label="药品分类"
                    name="category"
                    rules={[{ required: true, message: '请选择药品分类' }]}
                  >
                    <Select placeholder="请选择分类">
                      {categories.map(cat => (
                        <Option key={cat._id || cat.code} value={cat.name}>
                          {cat.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label="药品类型"
                    name="type"
                    rules={[{ required: true, message: '请选择药品类型' }]}
                  >
                    <Select placeholder="请选择类型">
                      <Option value="otc">OTC药品</Option>
                      <Option value="prescription">处方药</Option>
                      <Option value="health">保健品</Option>
                      <Option value="medical_device">医疗器械</Option>
                      <Option value="others">其他</Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label="规格"
                    name="specification"
                    rules={[{ required: true, message: '请输入规格' }]}
                  >
                    <Input placeholder="如：0.3g*20粒" />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label="剂型"
                    name="dosage"
                  >
                    <Input placeholder="如：胶囊剂" />
                  </Form.Item>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label="生产厂家"
                    name="manufacturer"
                    rules={[{ required: true, message: '请输入生产厂家' }]}
                  >
                    <Input placeholder="请输入生产厂家" />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label="批准文号"
                    name="approvalNumber"
                    rules={[{ required: true, message: '请输入批准文号' }]}
                  >
                    <Input placeholder="如：国药准字H12345678" />
                  </Form.Item>
                </div>
              </div>
            </Card>

            <Card title="价格库存" className="form-section">
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ width: 200 }}>
                  <Form.Item
                    label="售价"
                    name="price"
                    rules={[{ required: true, message: '请输入售价' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      step={0.01}
                      precision={2}
                      prefix="¥"
                    />
                  </Form.Item>
                </div>
                <div style={{ width: 200 }}>
                  <Form.Item
                    label="原价"
                    name="originalPrice"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      step={0.01}
                      precision={2}
                      prefix="¥"
                    />
                  </Form.Item>
                </div>
                <div style={{ width: 200 }}>
                  <Form.Item
                    label="成本价"
                    name="costPrice"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      step={0.01}
                      precision={2}
                      prefix="¥"
                    />
                  </Form.Item>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ width: 200 }}>
                  <Form.Item
                    label="库存预警阈值"
                    name="stockWarningThreshold"
                  >
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </div>
                <div style={{ width: 200 }}>
                  <Form.Item
                    label="效期预警天数"
                    name="expiryWarningDays"
                  >
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </div>
              </div>
            </Card>

            <Card title="营销设置" className="form-section">
              <div style={{ display: 'flex', gap: 30 }}>
                <Form.Item
                  label="是否上架"
                  name="isOnSale"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label="是否热销"
                  name="isHot"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label="是否新品"
                  name="isNew"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label="是否推荐"
                  name="isRecommended"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </div>

              <Form.Item
                label="排序权重"
                name="sort"
              >
                <InputNumber min={0} max={999} />
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane tab="药品详情" key="detail">
            <Card title="药品说明" className="form-section">
              <Form.Item
                label="主要成分"
                name="mainIngredients"
              >
                <Select
                  mode="tags"
                  placeholder="输入成分后回车添加"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="适应症"
                name="indications"
              >
                <TextArea rows={3} placeholder="请输入适应症" />
              </Form.Item>

              <Form.Item
                label="用法用量"
                name="usageDosage"
              >
                <TextArea rows={3} placeholder="请输入用法用量" />
              </Form.Item>

              <Form.Item
                label="不良反应"
                name="adverseReactions"
              >
                <TextArea rows={3} placeholder="请输入不良反应" />
              </Form.Item>

              <Form.Item
                label="禁忌"
                name="contraindications"
              >
                <TextArea rows={3} placeholder="请输入禁忌" />
              </Form.Item>

              <Form.Item
                label="注意事项"
                name="precautions"
              >
                <TextArea rows={3} placeholder="请输入注意事项" />
              </Form.Item>

              <Form.Item
                label="药物相互作用"
                name="drugInteractions"
              >
                <TextArea rows={3} placeholder="请输入药物相互作用" />
              </Form.Item>

              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label="贮藏"
                    name="storage"
                  >
                    <Input placeholder="请输入贮藏条件" />
                  </Form.Item>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item
                    label="有效期"
                    name="validityPeriod"
                  >
                    <Input placeholder="如：24个月" />
                  </Form.Item>
                </div>
              </div>
            </Card>

            <Card title="商品描述" className="form-section">
              <Form.Item
                label="简短描述"
                name="description"
              >
                <TextArea rows={3} placeholder="请输入简短描述" />
              </Form.Item>

              <Form.Item
                label="详细描述"
                name="richDescription"
              >
                <TextArea rows={10} placeholder="请输入详细描述" />
              </Form.Item>

              <Form.Item
                label="标签"
                name="tags"
              >
                <Select
                  mode="tags"
                  placeholder="输入标签后回车添加"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Card>
          </TabPane>
        </Tabs>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Space size="large">
            <Button onClick={() => navigate(-1)}>取消</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {isEdit ? '保存修改' : '创建药品'}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  )
}

export default MedicineForm
