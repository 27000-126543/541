import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useApp } from '../../store/context';
import { getMedicineDetail } from '../../services/medicine';
import { formatPrice } from '../../utils';
import './detail.scss';

const MedicineDetail = () => {
  const router = useRouter();
  const { id } = router.params;
  const { addToCart, currentStore } = useApp();
  const [medicine, setMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('detail');

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      const res = await getMedicineDetail(id, { storeId: currentStore?._id });
      if (res.code === 0) {
        setMedicine(res.data);
      }
    } catch (e) {
      console.error('加载药品详情失败', e);
    }
  };

  const handleAddCart = () => {
    if (!medicine) return;
    
    addToCart({
      medicineId: medicine._id,
      medicineName: medicine.name,
      specification: medicine.specification,
      price: medicine.storePrice || medicine.price,
      storeId: currentStore?._id,
      image: medicine.coverImage,
      quantity
    });
  };

  const handleBuyNow = () => {
    if (!medicine) return;
    
    handleAddCart();
    Taro.navigateTo({ url: '/pages/order/confirm' });
  };

  const handleQuantityChange = (delta) => {
    const newQty = Math.max(1, quantity + delta);
    setQuantity(newQty);
  };

  if (!medicine) {
    return (
      <View className='loading'>
        <Text>加载中...</Text>
      </View>
    );
  }

  const typeMap = {
    otc: { text: 'OTC', class: 'tag-otc' },
    prescription: { text: '处方药', class: 'tag-rx' },
    health: { text: '保健品', class: 'tag-health' },
    medical_device: { text: '医疗器械', class: 'tag-device' }
  };

  const typeInfo = typeMap[medicine.type] || { text: '其他', class: '' };

  return (
    <View className='medicine-detail'>
      <ScrollView scrollY className='content'>
        <View className='image-section'>
          <View className='main-image'>
            <Text className='medicine-emoji'>💊</Text>
          </View>
          {medicine.images && medicine.images.length > 0 && (
            <ScrollView scrollX className='thumb-list'>
              {medicine.images.map((img, index) => (
                <View key={index} className='thumb-item'>
                  <Text className='medicine-emoji'>💊</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View className='info-section'>
          <View className='price-row'>
            <View className='price'>
              <Text className='price-symbol'>¥</Text>
              <Text className='price-value'>{formatPrice(medicine.storePrice || medicine.price)}</Text>
            </View>
            {medicine.originalPrice && (
              <Text className='original-price'>¥{formatPrice(medicine.originalPrice)}</Text>
            )}
            <View className={`type-tag ${typeInfo.class}`}>
              {typeInfo.text}
            </View>
          </View>

          <Text className='name'>{medicine.name}</Text>
          <Text className='generic-name'>{medicine.genericName}</Text>
          
          <View className='spec-row'>
            <Text className='spec'>{medicine.specification}</Text>
            <Text className='manufacturer'>{medicine.manufacturer}</Text>
          </View>

          <View className='stats-row'>
            <Text className='sales'>销量 {medicine.salesCount || 0}</Text>
            <Text className='reviews'>评价 {medicine.reviewCount || 0}</Text>
            <Text className='rating'>⭐ {medicine.averageRating || 5}</Text>
          </View>

          {medicine.tags && medicine.tags.length > 0 && (
            <View className='tags-row'>
              {medicine.tags.map((tag, index) => (
                <View key={index} className='tag'>{tag}</View>
              ))}
            </View>
          )}
        </View>

        <View className='tabs-section'>
          <View className='tabs'>
            <View 
              className={`tab ${activeTab === 'detail' ? 'active' : ''}`}
              onClick={() => setActiveTab('detail')}
            >
              商品详情
            </View>
            <View 
              className={`tab ${activeTab === 'instruction' ? 'active' : ''}`}
              onClick={() => setActiveTab('instruction')}
            >
              说明书
            </View>
            <View 
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              用户评价
            </View>
          </View>
        </View>

        <View className='tab-content'>
          {activeTab === 'detail' && (
            <View className='detail-content'>
              <View className='detail-item'>
                <Text className='item-label'>通用名称</Text>
                <Text className='item-value'>{medicine.genericName || '-'}</Text>
              </View>
              <View className='detail-item'>
                <Text className='item-label'>商品编号</Text>
                <Text className='item-value'>{medicine._id}</Text>
              </View>
              <View className='detail-item'>
                <Text className='item-label'>生产厂家</Text>
                <Text className='item-value'>{medicine.manufacturer}</Text>
              </View>
              <View className='detail-item'>
                <Text className='item-label'>批准文号</Text>
                <Text className='item-value'>{medicine.approvalNumber}</Text>
              </View>
              <View className='detail-item'>
                <Text className='item-label'>规格</Text>
                <Text className='item-value'>{medicine.specification}</Text>
              </View>
              <View className='detail-item'>
                <Text className='item-label'>品牌</Text>
                <Text className='item-value'>{medicine.brand || '-'}</Text>
              </View>
            </View>
          )}

          {activeTab === 'instruction' && (
            <View className='instruction-content'>
              <View className='section'>
                <Text className='section-title'>【适应症】</Text>
                <Text className='section-content'>{medicine.indications || '详见说明书'}</Text>
              </View>
              <View className='section'>
                <Text className='section-title'>【用法用量】</Text>
                <Text className='section-content'>{medicine.usageDosage || '详见说明书'}</Text>
              </View>
              <View className='section'>
                <Text className='section-title'>【主要成分】</Text>
                <Text className='section-content'>
                  {medicine.mainIngredients?.join('、') || '详见说明书'}
                </Text>
              </View>
              <View className='section'>
                <Text className='section-title'>【不良反应】</Text>
                <Text className='section-content'>{medicine.adverseReactions || '详见说明书'}</Text>
              </View>
              <View className='section'>
                <Text className='section-title'>【禁忌】</Text>
                <Text className='section-content'>{medicine.contraindications || '详见说明书'}</Text>
              </View>
              <View className='section'>
                <Text className='section-title'>【注意事项】</Text>
                <Text className='section-content'>{medicine.precautions || '详见说明书'}</Text>
              </View>
              <View className='section'>
                <Text className='section-title'>【贮藏】</Text>
                <Text className='section-content'>{medicine.storage || '详见说明书'}</Text>
              </View>
            </View>
          )}

          {activeTab === 'reviews' && (
            <View className='reviews-content'>
              <View className='empty-reviews'>
                <Text className='empty-icon'>💬</Text>
                <Text className='empty-text'>暂无评价</Text>
              </View>
            </View>
          )}
        </View>

        <View className='bottom-space' />
      </ScrollView>

      <View className='footer'>
        <View className='footer-left'>
          <View className='footer-icon' onClick={() => Taro.switchTab({ url: '/pages/home/index' })}>
            <Text>🏠</Text>
            <Text className='icon-text'>首页</Text>
          </View>
          <View className='footer-icon' onClick={() => Taro.switchTab({ url: '/pages/cart/index' })}>
            <Text>🛒</Text>
            <Text className='icon-text'>购物车</Text>
          </View>
        </View>
        
        <View className='footer-right'>
          <View className='quantity-control'>
            <View 
              className='qty-btn minus'
              onClick={() => handleQuantityChange(-1)}
            >
              -
            </View>
            <Text className='qty-value'>{quantity}</Text>
            <View 
              className='qty-btn plus'
              onClick={() => handleQuantityChange(1)}
            >
              +
            </View>
          </View>
          
          <View className='btn add-cart' onClick={handleAddCart}>
            加入购物车
          </View>
          <View className='btn buy-now' onClick={handleBuyNow}>
            立即购买
          </View>
        </View>
      </View>
    </View>
  );
};

export default MedicineDetail;
