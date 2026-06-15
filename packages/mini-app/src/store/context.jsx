import React, { useState } from 'react';
import { createContext, useContext } from 'react';
import Taro from '@tarojs/taro';

const safeGetStorage = (key) => {
  try {
    return Taro.getStorageSync(key) || null;
  } catch (e) {
    return null;
  }
};

const safeSetStorage = (key, value) => {
  try {
    Taro.setStorageSync(key, value);
  } catch (e) {
    console.warn('存储失败', e);
  }
};

const safeRemoveStorage = (key) => {
  try {
    Taro.removeStorageSync(key);
  } catch (e) {
    console.warn('删除存储失败', e);
  }
};

const safeShowToast = (options) => {
  try {
    Taro.showToast(options);
  } catch (e) {
    console.warn('showToast失败', e);
  }
};

const AppContext = createContext(null);

export const Provider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(safeGetStorage('userInfo'));
  const [cartList, setCartList] = useState(safeGetStorage('cartList') || []);
  const [currentStore, setCurrentStore] = useState(safeGetStorage('currentStore'));

  const login = (token, user) => {
    safeSetStorage('token', token);
    safeSetStorage('userInfo', user);
    setUserInfo(user);
  };

  const logout = () => {
    safeRemoveStorage('token');
    safeRemoveStorage('userInfo');
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
    safeSetStorage('cartList', newCart);
    
    safeShowToast({
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
    safeSetStorage('cartList', newCart);
  };

  const toggleCartItemSelect = (medicineId, storeId) => {
    const newCart = cartList.map(item => {
      if (item.medicineId === medicineId && item.storeId === storeId) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
    
    setCartList(newCart);
    safeSetStorage('cartList', newCart);
  };

  const toggleSelectAll = (storeId, selected) => {
    const newCart = cartList.map(item => {
      if (item.storeId === storeId) {
        return { ...item, selected };
      }
      return item;
    });
    
    setCartList(newCart);
    safeSetStorage('cartList', newCart);
  };

  const removeFromCart = (medicineId, storeId) => {
    const newCart = cartList.filter(item => 
      !(item.medicineId === medicineId && item.storeId === storeId)
    );
    
    setCartList(newCart);
    safeSetStorage('cartList', newCart);
  };

  const clearSelectedCart = (storeId) => {
    const newCart = cartList.filter(item => 
      !(item.storeId === storeId && item.selected)
    );
    
    setCartList(newCart);
    safeSetStorage('cartList', newCart);
  };

  const getCartTotal = (storeId) => {
    const items = cartList.filter(item => item.storeId === storeId && item.selected);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    return { total, count, items };
  };

  const setStore = (store) => {
    setCurrentStore(store);
    safeSetStorage('currentStore', store);
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
    return {
      userInfo: null,
      setUserInfo: () => {},
      cartList: [],
      currentStore: null,
      login: () => {},
      logout: () => {},
      addToCart: () => {},
      updateCartItem: () => {},
      toggleCartItemSelect: () => {},
      toggleSelectAll: () => {},
      removeFromCart: () => {},
      clearSelectedCart: () => {},
      getCartTotal: () => ({ total: 0, count: 0, items: [] }),
      setStore: () => {}
    };
  }
  return context;
};
