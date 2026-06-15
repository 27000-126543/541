import { Component } from 'react'
import Taro from '@tarojs/taro'
import { Provider } from './store/context'
import './app.scss'

class App extends Component {
  componentDidMount () {
    try {
      const token = Taro.getStorageSync('token')
      if (token) {
        this.fetchUserInfo()
      }
    } catch (e) {
      console.warn('读取token失败', e)
    }
  }

  fetchUserInfo = async () => {
    try {
      const { getUserInfo } = require('./services/user')
      const res = await getUserInfo()
      if (res && res.code === 0) {
        try {
          Taro.setStorageSync('userInfo', res.data)
        } catch (e) {
          console.warn('存储用户信息失败', e)
        }
      }
    } catch (e) {
      console.warn('获取用户信息失败', e)
    }
  }

  render () {
    return (
      <Provider>
        {this.props.children}
      </Provider>
    )
  }
}

export default App
