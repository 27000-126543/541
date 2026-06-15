import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getCategories, getMedicineList } from '../../services/medicine';
import { formatPrice } from '../../utils';
import './index.scss';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeCategory) {
      loadMedicines();
    }
  }, [activeCategory]);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      if (res.code === 0) {
        setCategories(res.data);
        if (res.data.length > 0) {
          setActiveCategory(res.data[0]._id || res.data[0].code);
        }
      }
    } catch (e) {
      console.error('加载分类失败', e);
    }
  };

  const loadMedicines = async () => {
    try {
      const res = await getMedicineList({
        category: activeCategory,
        pageSize: 50
      });
      if (res.code === 0) {
        setMedicines(res.data.list);
      }
    } catch (e) {
      console.error('加载药品失败', e);
    }
  };

  const goToDetail = (id) => {
    Taro.navigateTo({
      url: `/pages/medicine/detail?id=${id}`
    });
  };

  return (
    <View className='category-page'>
      <View className='search-bar'>
        <Input
          className='search-input'
          placeholder='搜索药品'
          value={searchValue}
          onInput={e => setSearchValue(e.detail.value)}
          onConfirm={() => {
            Taro.navigateTo({ url: `/pages/search/index?keyword=${searchValue}` });
          }}
        />
      </View>
      
      <View className='content'>
        <ScrollView scrollY className='category-nav'>
          {categories.map(cat => (
            <View
              key={cat._id || cat.code}
              className={`nav-item ${activeCategory === (cat._id || cat.code) ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat._id || cat.code)}
            >
              <Text className='nav-name'>{cat.name}</Text>
              {activeCategory === (cat._id || cat.code) && <View className='nav-line' />}
            </View>
          ))}
        </ScrollView>

        <ScrollView scrollY className='medicine-list'>
          <View className='list-header'>
            <Text className='list-title'>{categories.find(c => (c._id || c.code) === activeCategory)?.name || '全部药品'}</Text>
            <Text className='list-count'>共{medicines.length}件</Text>
          </View>
          
          {medicines.map(med => (
            <View
              key={med._id}
              className='medicine-item'
              onClick={() => goToDetail(med._id)}
            >
              <View className='item-image'>
                <Text className='medicine-emoji'>💊</Text>
              </View>
              <View className='item-info'>
                <Text className='item-name ellipsis-2'>{med.name}</Text>
                <Text className='item-spec ellipsis'>{med.specification}</Text>
                <Text className='item-manufacturer ellipsis'>{med.manufacturer}</Text>
                <View className='item-bottom'>
                  <Text className='item-price'>
                    <Text className='price-symbol'>¥</Text>
                    {formatPrice(med.price)}
                  </Text>
                  {med.originalPrice && (
                    <Text className='item-original'>¥{formatPrice(med.originalPrice)}</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
          
          {medicines.length === 0 && (
            <View className='empty'>
              <Text className='empty-icon'>📦</Text>
              <Text className='empty-text'>暂无药品</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default Category;
