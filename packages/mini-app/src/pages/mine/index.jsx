import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/context';
import { getUserInfo } from '../../services/user';
import { getMemberLevelText, getMemberLevelColor } from '../../utils';
import './index.scss';

const Mine = () => {
  const { userInfo, setUserInfo, logout } = useApp();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (userInfo) {
      loadUserInfo();
    }
  }, [userInfo]);

  const loadUserInfo = async () => {
    try {
      const res = await getUserInfo();
      if (res.code === 0) {
        setUserData(res.data);
        setUserInfo(res.data);
        Taro.setStorageSync('userInfo', res.data);
      }
    } catch (e) {
      console.error('获取用户信息失败', e);
    }
  };

  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/user/login' });
  };

  const goToPage = (path) => {
    if (!userInfo) {
      handleLogin();
      return;
    }
    Taro.navigateTo({ url: path });
  };

  const orderMenus = [
    { id: 'pending_payment', name: '待付款', icon: '💳' },
    { id: 'pending_delivery', name: '待发货', icon: '📦' },
    { id: 'shipped', name: '配送中', icon: '🚚' },
    { id: 'completed', name: '已完成', icon: '✅' }
  ];

  const serviceMenus = [
    { id: 'consultation', name: '我的问诊', icon: '👨‍⚕️', path: '/pages/consultation/list' },
    { id: 'prescription', name: '我的处方', icon: '📝', path: '/pages/prescription/list' },
    { id: 'address', name: '收货地址', icon: '📍', path: '/pages/address/list' },
    { id: 'health', name: '健康档案', icon: '❤️', path: '/pages/health/profile' },
    { id: 'insurance', name: '医保绑定', icon: '🏥', path: '' },
    { id: 'member', name: '会员中心', icon: '👑', path: '/pages/member/index' }
  ];

  const settingMenus = [
    { id: 'profile', name: '个人资料', icon: '👤', path: '/pages/user/profile' },
    { id: 'feedback', name: '意见反馈', icon: '💬', path: '' },
    { id: 'about', name: '关于我们', icon: 'ℹ️', path: '' },
    { id: 'settings', name: '设置', icon: '⚙️', path: '' }
  ];

  const handleOrderClick = (status) => {
    goToPage(`/pages/order/list?status=${status}`);
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout();
        }
      }
    });
  };

  return (
    <View className='mine-page'>
      <ScrollView scrollY className='content'>
        <View className='user-header'>
          {userInfo ? (
            <>
              <View className='user-info'>
                <View className='avatar'>
                  {userInfo.avatar ? (
                    <Image src={userInfo.avatar} className='avatar-img' />
                  ) : (
                    <Text className='avatar-placeholder'>👤</Text>
                  )}
                </View>
                <View className='user-detail'>
                  <Text className='nickname'>{userInfo.nickname}</Text>
                  <View 
                    className='member-badge'
                    style={{ backgroundColor: getMemberLevelColor(userInfo.memberLevel) + '20', color: getMemberLevelColor(userInfo.memberLevel) }}
                    onClick={() => goToPage('/pages/member/index')}
                  >
                    <Text className='member-icon'>👑</Text>
                    <Text className='member-name'>{getMemberLevelText(userInfo.memberLevel)}</Text>
                  </View>
                </View>
              </View>
              
              {userData?.nextLevelInfo && userData.nextLevelInfo.nextLevel && (
                <View className='level-progress'>
                  <View className='progress-text'>
                    <Text>距离{userData.nextLevelInfo.nextLevelInfo?.name || '下一等级'}</Text>
                    <Text className='progress-amount'>还差¥{userData.nextLevelInfo.amountToNext || 0}</Text>
                  </View>
                  <View className='progress-bar'>
                    <View 
                      className='progress-inner' 
                      style={{ width: `${userData.nextLevelInfo.progress || 0}%` }}
                    />
                  </View>
                </View>
              )}

              <View className='user-stats'>
                <View className='stat-item'>
                  <Text className='stat-value'>{userData?.memberPoints || 0}</Text>
                  <Text className='stat-label'>积分</Text>
                </View>
                <View className='stat-divider' />
                <View className='stat-item'>
                  <Text className='stat-value'>{userData?.freeConsultationCount || 0}</Text>
                  <Text className='stat-label'>免费问诊</Text>
                </View>
                <View className='stat-divider' />
                <View className='stat-item'>
                  <Text className='stat-value'>{userData?.yearlyConsumption || 0}</Text>
                  <Text className='stat-label'>年消费</Text>
                </View>
              </View>
            </>
          ) : (
            <View className='login-prompt' onClick={handleLogin}>
              <View className='avatar'>
                <Text className='avatar-placeholder'>👤</Text>
              </View>
              <Text className='login-text'>点击登录 / 注册</Text>
            </View>
          )}
        </View>

        <View className='order-section'>
          <View className='section-header'>
            <Text className='section-title'>我的订单</Text>
            <Text className='section-more' onClick={() => handleOrderClick('all')}>
              全部订单 ›
            </Text>
          </View>
          <View className='order-menus'>
            {orderMenus.map(menu => (
              <View 
                key={menu.id} 
                className='order-menu'
                onClick={() => handleOrderClick(menu.id)}
              >
                <View className='menu-icon'>{menu.icon}</View>
                <Text className='menu-name'>{menu.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='service-section'>
          <View className='section-header'>
            <Text className='section-title'>我的服务</Text>
          </View>
          <View className='service-grid'>
            {serviceMenus.map(menu => (
              <View 
                key={menu.id} 
                className='service-item'
                onClick={() => goToPage(menu.path)}
              >
                <View className='service-icon'>{menu.icon}</View>
                <Text className='service-name'>{menu.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='setting-section'>
          <View className='section-header'>
            <Text className='section-title'>设置</Text>
          </View>
          <View className='setting-list'>
            {settingMenus.map(menu => (
              <View 
                key={menu.id} 
                className='setting-item'
                onClick={() => goToPage(menu.path)}
              >
                <View className='setting-left'>
                  <Text className='setting-icon'>{menu.icon}</Text>
                  <Text className='setting-name'>{menu.name}</Text>
                </View>
                <Text className='setting-arrow'>›</Text>
              </View>
            ))}
          </View>
        </View>

        {userInfo && (
          <View className='logout-section'>
            <View className='logout-btn' onClick={handleLogout}>
              退出登录
            </View>
          </View>
        )}

        <View className='bottom-space' />
      </ScrollView>
    </View>
  );
};

export default Mine;
