import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Input, Swiper, SwiperItem } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/context';
import { getRecommendMedicines, getHotKeywords } from '../../services/medicine';
import { getNearestStore } from '../../services/store';
import { getFlashSaleList } from '../../services/promotion';
import { formatPrice, formatDistance } from '../../utils';
import './index.scss';

const Home = () => {
  const { currentStore, setStore } = useApp();
  const [searchValue, setSearchValue] = useState('');
  const [hotMedicines, setHotMedicines] = useState([]);
  const [newMedicines, setNewMedicines] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [hotKeywords, setHotKeywords] = useState([]);
  const [banners] = useState([
    { id: 1, image: '', title: '新人专享9折优惠' },
    { id: 2, image: '', title: '夏季养生节 满199减30' },
    { id: 3, image: '', title: '家庭常备药 限时特惠' }
  ]);

  const categories = [
    { id: 'cold_cough', name: '感冒咳嗽', icon: '🤒' },
    { id: 'digestive', name: '肠胃消化', icon: '💊' },
    { id: 'vitamin', name: '维矿保健', icon: '💪' },
    { id: 'skin', name: '皮肤用药', icon: '🧴' },
    { id: 'medical_device', name: '医疗器械', icon: '🩺' },
    { id: 'gynecology', name: '妇科用药', icon: '👩' },
    { id: 'cardio', name: '心脑血管', icon: '❤️' },
    { id: 'more', name: '更多分类', icon: '📋' }
  ];

  const quickEntries = [
    { id: 'consultation', name: '在线问诊', icon: '👨‍⚕️', path: '/pages/consultation/doctors' },
    { id: 'prescription', name: '处方上传', icon: '📝', path: '/pages/prescription/upload' },
    { id: 'insurance', name: '医保支付', icon: '🏥', path: '' },
    { id: 'member', name: '会员中心', icon: '👑', path: '/pages/member/index' }
  ];

  useEffect(() => {
    loadData();
    loadNearestStore();
  }, []);

  const loadData = async () => {
    try {
      const [hotRes, newRes, flashRes, keywordRes] = await Promise.all([
        getRecommendMedicines({ type: 'hot', limit: 10, storeId: currentStore?._id }),
        getRecommendMedicines({ type: 'new', limit: 6, storeId: currentStore?._id }),
        getFlashSaleList(),
        getHotKeywords()
      ]);

      if (hotRes.code === 0) setHotMedicines(hotRes.data);
      if (newRes.code === 0) setNewMedicines(newRes.data);
      if (flashRes.code === 0) setFlashSales(flashRes.data);
      if (keywordRes.code === 0) setHotKeywords(keywordRes.data);
    } catch (e) {
      console.error('加载数据失败', e);
    }
  };

  const loadNearestStore = async () => {
    try {
      Taro.getLocation({
        type: 'gcj02',
        success: async (res) => {
          const storeRes = await getNearestStore({
            longitude: res.longitude,
            latitude: res.latitude
          });
          if (storeRes.code === 0 && storeRes.data) {
            setStore(storeRes.data);
          }
        },
        fail: () => {
          console.log('获取位置失败');
        }
      });
    } catch (e) {
      console.error('获取门店失败', e);
    }
  };

  const handleSearch = () => {
    Taro.navigateTo({
      url: `/pages/search/index?keyword=${searchValue}`
    });
  };

  const goToMedicineDetail = (id) => {
    Taro.navigateTo({
      url: `/pages/medicine/detail?id=${id}`
    });
  };

  const goToCategory = (id) => {
    Taro.switchTab({
      url: '/pages/category/index'
    });
  };

  const goToQuickEntry = (path) => {
    if (path) {
      Taro.navigateTo({ url: path });
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  return (
    <View className='home-page'>
      <View className='header'>
        <View className='location' onClick={() => Taro.navigateTo({ url: '/pages/store/list' })}>
          <Text className='location-icon'>📍</Text>
          <Text className='location-text ellipsis'>
            {currentStore?.name || '选择门店'}
            {currentStore?.distance && <Text className='distance'> {formatDistance(currentStore.distance)}</Text>}
          </Text>
          <Text className='location-arrow'>▼</Text>
        </View>
        <View className='search-bar' onClick={handleSearch}>
          <Text className='search-icon'>🔍</Text>
          <Input
            className='search-input'
            placeholder='搜索药品、症状'
            value={searchValue}
            onInput={e => setSearchValue(e.detail.value)}
            onConfirm={handleSearch}
          />
        </View>
      </View>

      <ScrollView scrollY className='content'>
        <Swiper className='banner' autoplay indicatorDots circular>
          {banners.map(banner => (
            <SwiperItem key={banner.id}>
              <View className='banner-item'>
                <Text className='banner-title'>{banner.title}</Text>
              </View>
            </SwiperItem>
          ))}
        </Swiper>

        <View className='quick-entries'>
          {quickEntries.map(entry => (
            <View 
              key={entry.id} 
              className='quick-entry'
              onClick={() => goToQuickEntry(entry.path)}
            >
              <View className='quick-icon'>{entry.icon}</View>
              <Text className='quick-name'>{entry.name}</Text>
            </View>
          ))}
        </View>

        {flashSales.length > 0 && (
          <View className='section flash-sale'>
            <View className='section-header'>
              <Text className='section-title'>⚡ 限时秒杀</Text>
              <Text className='section-more'>更多 ›</Text>
            </View>
            <ScrollView scrollX className='flash-list'>
              {hotMedicines.slice(0, 6).map(med => (
                <View 
                  key={med._id} 
                  className='flash-item'
                  onClick={() => goToMedicineDetail(med._id)}
                >
                  <View className='flash-image'>
                    <Text className='medicine-emoji'>💊</Text>
                  </View>
                  <Text className='flash-name ellipsis'>{med.name}</Text>
                  <View className='flash-price'>
                    <Text className='price-symbol'>¥</Text>
                    <Text className='price-value'>{formatPrice(med.storePrice || med.price)}</Text>
                  </View>
                  <Text className='flash-original'>¥{formatPrice(med.originalPrice || med.price)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View className='section categories'>
          <View className='section-header'>
            <Text className='section-title'>📋 药品分类</Text>
          </View>
          <View className='category-grid'>
            {categories.map(cat => (
              <View 
                key={cat.id} 
                className='category-item'
                onClick={() => goToCategory(cat.id)}
              >
                <View className='category-icon'>{cat.icon}</View>
                <Text className='category-name'>{cat.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='section hot-sale'>
          <View className='section-header'>
            <Text className='section-title'>🔥 热销推荐</Text>
            <Text className='section-more'>查看更多 ›</Text>
          </View>
          <View className='medicine-grid'>
            {hotMedicines.map(med => (
              <View 
                key={med._id} 
                className='medicine-card'
                onClick={() => goToMedicineDetail(med._id)}
              >
                <View className='medicine-image'>
                  <Text className='medicine-emoji'>💊</Text>
                  {med.isHot && <View className='hot-tag'>热销</View>}
                </View>
                <View className='medicine-info'>
                  <Text className='medicine-name ellipsis-2'>{med.name}</Text>
                  <Text className='medicine-spec ellipsis'>{med.specification}</Text>
                  <View className='medicine-bottom'>
                    <View className='medicine-price'>
                      <Text className='price-symbol'>¥</Text>
                      <Text className='price-value'>{formatPrice(med.storePrice || med.price)}</Text>
                    </View>
                    <Text className='sales-count'>已售{med.salesCount || 0}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className='section new-arrival'>
          <View className='section-header'>
            <Text className='section-title'>✨ 新品上架</Text>
          </View>
          <View className='medicine-list'>
            {newMedicines.map(med => (
              <View 
                key={med._id} 
                className='medicine-list-item'
                onClick={() => goToMedicineDetail(med._id)}
              >
                <View className='item-image'>
                  <Text className='medicine-emoji'>💊</Text>
                </View>
                <View className='item-info'>
                  <Text className='item-name ellipsis'>{med.name}</Text>
                  <Text className='item-spec ellipsis'>{med.specification}</Text>
                  <View className='item-tags'>
                    {med.type === 'otc' && <View className='tag'>OTC</View>}
                    {med.type === 'prescription' && <View className='tag tag-warning'>处方药</View>}
                    {med.type === 'health' && <View className='tag tag-success'>保健品</View>}
                  </View>
                </View>
                <View className='item-right'>
                  <Text className='item-price'>
                    <Text className='price-symbol'>¥</Text>
                    {formatPrice(med.storePrice || med.price)}
                  </Text>
                  <View className='add-cart-btn'>+</View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className='section hot-search'>
          <View className='section-header'>
            <Text className='section-title'>🔍 热门搜索</Text>
          </View>
          <View className='hot-keywords'>
            {hotKeywords.slice(0, 8).map((keyword, index) => (
              <View 
                key={index} 
                className='keyword-tag'
                onClick={() => {
                  setSearchValue(keyword);
                  handleSearch();
                }}
              >
                {keyword}
              </View>
            ))}
          </View>
        </View>

        <View className='bottom-space' />
      </ScrollView>
    </View>
  );
};

export default Home;
