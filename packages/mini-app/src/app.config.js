export default {
  pages: [
    'pages/home/index',
    'pages/category/index',
    'pages/cart/index',
    'pages/mine/index',
    'pages/medicine/detail',
    'pages/search/index',
    'pages/order/list',
    'pages/order/detail',
    'pages/order/confirm',
    'pages/consultation/list',
    'pages/consultation/detail',
    'pages/consultation/doctors',
    'pages/prescription/list',
    'pages/prescription/upload',
    'pages/prescription/detail',
    'pages/member/index',
    'pages/address/list',
    'pages/address/edit',
    'pages/health/profile',
    'pages/health/family',
    'pages/user/login',
    'pages/user/profile'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '医药商城',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#1677ff',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/tab/home.png',
        selectedIconPath: 'assets/tab/home-active.png'
      },
      {
        pagePath: 'pages/category/index',
        text: '分类',
        iconPath: 'assets/tab/category.png',
        selectedIconPath: 'assets/tab/category-active.png'
      },
      {
        pagePath: 'pages/cart/index',
        text: '购物车',
        iconPath: 'assets/tab/cart.png',
        selectedIconPath: 'assets/tab/cart-active.png'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/tab/mine.png',
        selectedIconPath: 'assets/tab/mine-active.png'
      }
    ]
  },
  permission: {
    'scope.userLocation': {
      desc: '您的位置信息将用于查找附近门店'
    }
  }
}
