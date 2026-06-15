import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Checkbox } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/context';
import { formatPrice } from '../../utils';
import './index.scss';

const Cart = () => {
  const { cartList, currentStore, updateCartItem, toggleCartItemSelect, toggleSelectAll, removeFromCart, getCartTotal } = useApp();

  const storeCart = useMemo(() => {
    if (!currentStore) return [];
    return cartList.filter(item => item.storeId === currentStore._id);
  }, [cartList, currentStore]);

  const { total, count } = useMemo(() => {
    if (!currentStore) return { total: 0, count: 0 };
    return getCartTotal(currentStore._id);
  }, [cartList, currentStore]);

  const allSelected = useMemo(() => {
    if (storeCart.length === 0) return false;
    return storeCart.every(item => item.selected);
  }, [storeCart]);

  const handleQuantityChange = (item, delta) => {
    const newQuantity = Math.max(1, item.quantity + delta);
    updateCartItem(item.medicineId, newQuantity, item.storeId);
  };

  const handleSelectAll = () => {
    if (!currentStore) return;
    toggleSelectAll(currentStore._id, !allSelected);
  };

  const handleCheckout = () => {
    if (count === 0) {
      Taro.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }
    Taro.navigateTo({ url: '/pages/order/confirm' });
  };

  const handleDelete = (item) => {
    Taro.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          removeFromCart(item.medicineId, item.storeId);
        }
      }
    });
  };

  if (!currentStore) {
    return (
      <View className='cart-page'>
        <View className='empty-store'>
          <Text className='empty-icon'>🏪</Text>
          <Text className='empty-text'>请先选择门店</Text>
        </View>
      </View>
    );
  }

  return (
    <View className='cart-page'>
      <View className='header'>
        <Text className='store-name'>{currentStore.name}</Text>
        <Text className='store-desc'>支持自提/配送</Text>
      </View>

      <ScrollView scrollY className='cart-list'>
        {storeCart.length === 0 ? (
          <View className='empty-cart'>
            <Text className='empty-icon'>🛒</Text>
            <Text className='empty-text'>购物车空空如也</Text>
            <View 
              className='go-shopping-btn'
              onClick={() => Taro.switchTab({ url: '/pages/home/index' })}
            >
              去逛逛
            </View>
          </View>
        ) : (
          storeCart.map(item => (
            <View key={item.medicineId} className='cart-item'>
              <Checkbox 
                checked={item.selected} 
                onChange={() => toggleCartItemSelect(item.medicineId, item.storeId)}
                color='#1677ff'
              />
              <View className='item-image'>
                <Text className='medicine-emoji'>💊</Text>
              </View>
              <View className='item-info'>
                <Text className='item-name ellipsis-2'>{item.medicineName}</Text>
                <Text className='item-spec ellipsis'>{item.specification}</Text>
                <View className='item-bottom'>
                  <Text className='item-price'>
                    <Text className='price-symbol'>¥</Text>
                    {formatPrice(item.price)}
                  </Text>
                  <View className='quantity-control'>
                    <View 
                      className='qty-btn minus'
                      onClick={() => handleQuantityChange(item, -1)}
                    >
                      -
                    </View>
                    <Text className='qty-value'>{item.quantity}</Text>
                    <View 
                      className='qty-btn plus'
                      onClick={() => handleQuantityChange(item, 1)}
                    >
                      +
                    </View>
                  </View>
                </View>
              </View>
              <View 
                className='delete-btn'
                onClick={() => handleDelete(item)}
              >
                🗑️
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View className='footer'>
        <View className='select-all' onClick={handleSelectAll}>
          <Checkbox checked={allSelected} color='#1677ff' />
          <Text className='select-text'>全选</Text>
        </View>
        <View className='total-info'>
          <Text className='total-label'>合计：</Text>
          <Text className='total-price'>
            <Text className='price-symbol'>¥</Text>
            {formatPrice(total)}
          </Text>
        </View>
        <View 
          className={`checkout-btn ${count === 0 ? 'disabled' : ''}`}
          onClick={handleCheckout}
        >
          去结算({count})
        </View>
      </View>
    </View>
  );
};

export default Cart;
