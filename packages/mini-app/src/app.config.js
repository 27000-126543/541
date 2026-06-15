export default {
  pages: [
    'pages/home/index',
    'pages/category/index',
    'pages/cart/index',
    'pages/mine/index',
    'pages/medicine/detail',
    'pages/user/login'
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
        text: '首页'
      },
      {
        pagePath: 'pages/category/index',
        text: '分类'
      },
      {
        pagePath: 'pages/cart/index',
        text: '购物车'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  },
  permission: {
    'scope.userLocation': {
      desc: '您的位置信息将用于查找附近门店'
    }
  }
}
