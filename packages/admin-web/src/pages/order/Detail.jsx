import { useParams } from 'react-router-dom'

const OrderDetail = () => {
  const { id } = useParams()
  return <div>订单详情 - {id}</div>
}

export default OrderDetail
