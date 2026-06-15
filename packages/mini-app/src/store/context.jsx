import { useState } from 'react';
import { createContext, useContext } from 'react';
import Taro from '@tarojs/taro';

const AppContext = createContext(null);

export const Provider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(Taro.getStorageSync('userInfo') || null);
  const [cartList, setCartList] = useState(Taro.getStorageSync('cartList') || []);
  const [currentStore, setCurrentStore] = useState(Taro.getStorageSync('currentStore') || null);

  const login = (token, user) => {
    Taro.setStorageSync('token', token);
    Taro.setStorageSync('userInfo', user);
    setUserInfo(user);
  };

  const logout = () => {
    Taro.removeStorageSync('token');
    Taro.removeStorageSync('userInfo');
    setUserInfo(null);
  };

  const addToCart = (item) => {
    const newCart = [...cartList];
    const existIndex = newCart.findIndex(i => 
      i.medicineId === item.medicineId && i.storeId === item.storeId
    );
    
    if (existIndex > -1) {
      newCart[existIndex].quantity += item.quantity || 1;
    } else {
      newCart.push({
        ...item,
        quantity: item.quantity || 1,
        selected: true
      });
    }
    
    setCartList(newCart);
    Taro.setStorageSync('cartList', newCart);
    
    Taro.showToast({
      title: '已加入购物车',
      icon: 'success'
    });
  };

  const updateCartItem = (medicineId, quantity, storeId) => {
    const newCart = cartList.map(item => {
      if (item.medicineId === medicineId && item.storeId === storeId) {
        return { ...item, quantity };
      }
      return item;
    }).filter(item => item.quantity > 0);
    
    setCartList(newCart);
    Taro.setStorageSync('cartList', newCart);
  };

  const toggleCartItemSelect = (medicineId, storeId) => {
    const newCart = cartList.map(item => {
      if (item.medicineId === medicineId && item.storeId === storeId) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
    
    setCartList(newCart);
    Taro.setStorageSync('cartList', newCart);
  };

  const toggleSelectAll = (storeId, selected) => {
    const newCart = cartList.map(item => {
      if (item.storeId === storeId) {
        return { ...item, selected };
      }
      return item;
    });
    
    setCartList(newCart);
    Taro.setStorageSync('cartList', newCart);
  };

  const removeFromCart = (medicineId, storeId) => {
    const newCart = cartList.filter(item => 
      !(item.medicineId === medicineId && item.storeId === storeId)
    );
    
    setCartList(newCart);
    Taro.setStorageSync('cartList', newCart);
  };

  const clearSelectedCart = (storeId) => {
    const newCart = cartList.filter(item => 
      !(item.storeId === storeId && item.selected)
    );
    
    setCartList(newCart);
    Taro.setStorageSync('cartList', newCart);
  };

  const getCartTotal = (storeId) => {
    const items = cartList.filter(item => item.storeId === storeId && item.selected);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    return { total, count, items };
  };

  const setStore = (store) => {
    setCurrentStore(store);
    Taro.setStorageSync('currentStore', store);
  };

  const value = {
    userInfo,
    setUserInfo,
    cartList,
    currentStore,
    login,
    logout,
    addToCart,
    updateCartItem,
    toggleCartItemSelect,
    toggleSelectAll,
    removeFromCart,
    clearSelectedCart,
    getCartTotal,
    setStore
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within Provider');
  }
  return context;
};
