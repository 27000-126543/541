import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/context';
import { login, register } from '../../services/user';
import { validatePhone } from '../../utils';
import './login.scss';

const Login = () => {
  const { login: setLogin } = useApp();
  const [mode, setMode] = useState('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!validatePhone(phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    
    if (!password || password.length < 6) {
      Taro.showToast({ title: '密码至少6位', icon: 'none' });
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        Taro.showToast({ title: '两次密码不一致', icon: 'none' });
        return;
      }
    }

    setLoading(true);
    
    try {
      if (mode === 'login') {
        const res = await login({ phone, password });
        if (res.code === 0) {
          setLogin(res.data.token, res.data.user);
          Taro.showToast({ title: '登录成功', icon: 'success' });
          setTimeout(() => {
            Taro.switchTab({ url: '/pages/home/index' });
          }, 1000);
        }
      } else {
        const res = await register({ phone, password, nickname });
        if (res.code === 0) {
          setLogin(res.data.token, res.data.user);
          Taro.showToast({ title: '注册成功', icon: 'success' });
          setTimeout(() => {
            Taro.switchTab({ url: '/pages/home/index' });
          }, 1000);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <View className='login-page'>
      <View className='header'>
        <Text className='logo'>💊</Text>
        <Text className='title'>医药商城</Text>
        <Text className='subtitle'>专业的网上购药平台</Text>
      </View>

      <View className='form-container'>
        <View className='tab-bar'>
          <View 
            className={`tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            登录
          </View>
          <View 
            className={`tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            注册
          </View>
        </View>

        <View className='form'>
          <View className='form-item'>
            <Text className='label'>手机号</Text>
            <Input
              className='input'
              type='number'
              placeholder='请输入手机号'
              value={phone}
              onInput={e => setPhone(e.detail.value)}
              maxlength={11}
            />
          </View>

          {mode === 'register' && (
            <View className='form-item'>
              <Text className='label'>昵称</Text>
              <Input
                className='input'
                placeholder='请输入昵称'
                value={nickname}
                onInput={e => setNickname(e.detail.value)}
                maxlength={20}
              />
            </View>
          )}

          <View className='form-item'>
            <Text className='label'>密码</Text>
            <Input
              className='input'
              password
              placeholder='请输入密码'
              value={password}
              onInput={e => setPassword(e.detail.value)}
            />
          </View>

          {mode === 'register' && (
            <View className='form-item'>
              <Text className='label'>确认密码</Text>
              <Input
                className='input'
                password
                placeholder='请再次输入密码'
                value={confirmPassword}
                onInput={e => setConfirmPassword(e.detail.value)}
              />
            </View>
          )}

          <View 
            className={`submit-btn ${loading ? 'disabled' : ''}`}
            onClick={!loading ? handleSubmit : undefined}
          >
            {loading ? '提交中...' : (mode === 'login' ? '登录' : '注册')}
          </View>

          {mode === 'login' && (
            <View className='forget-password'>
              忘记密码？
            </View>
          )}
        </View>
      </View>

      <View className='agreement'>
        登录即表示同意
        <Text className='link'>《用户协议》</Text>
        和
        <Text className='link'>《隐私政策》</Text>
      </View>
    </View>
  );
};

export default Login;
