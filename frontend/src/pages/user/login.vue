<template>
  <view class="login-page">
    <!-- Logo -->
    <view class="logo-section">
      <text class="logo-text">Fashion</text>
      <text class="logo-sub">时尚女装精选</text>
    </view>

    <!-- Form -->
    <view class="form-section">
      <view class="form-item">
        <view class="form-label">
          <text class="label-icon">📱</text>
          <text class="label-text">手机号</text>
        </view>
        <input 
          class="form-input" 
          v-model="phone" 
          type="number" 
          maxlength="11" 
          placeholder="请输入手机号" 
          placeholder-class="input-placeholder"
        />
      </view>

      <view class="form-item">
        <view class="form-label">
          <text class="label-icon">🔒</text>
          <text class="label-text">密码</text>
        </view>
        <input 
          class="form-input" 
          v-model="password" 
          :type="showPassword ? 'text' : 'password'" 
          placeholder="请输入密码"
          placeholder-class="input-placeholder"
        />
        <view class="password-toggle" @tap="showPassword = !showPassword">
          <text>{{ showPassword ? '🙈' : '👁️' }}</text>
        </view>
      </view>

      <button class="btn-login" @tap="login">登 录</button>

      <view class="form-footer">
        <text class="link-text" @tap="goRegister">注册账号</text>
        <text class="divider">|</text>
        <text class="link-text" @tap="forgotPassword">忘记密码</text>
      </view>
    </view>

    <!-- Other Login -->
    <view class="other-login">
      <view class="divider-line">
        <view class="line"></view>
        <text class="divider-text">其他登录方式</text>
        <view class="line"></view>
      </view>
      <view class="other-icons">
        <view class="icon-item">
          <text class="icon">微</text>
          <text class="icon-label">微信</text>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { request, setToken } from '@/utils/request'

const phone = ref('')
const password = ref('')
const showPassword = ref(false)

const login = async () => {
  if (!phone.value || !password.value) {
    uni.showToast({ title: '请填写完整', icon: 'none' })
    return
  }
  if (!/^1\d{10}$/.test(phone.value)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }
  try {
    const res: any = await request('/auth/login', 'POST', { phone: phone.value, password: password.value })
    if (res.success) {
      setToken(res.token)
      uni.setStorageSync('userInfo', res.user)
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 800)
    }
  } catch (e: any) {
    uni.showToast({ title: e.error || '登录失败', icon: 'none' })
  }
}

const goRegister = () => {
  uni.showToast({ title: '请联系管理员注册', icon: 'none' })
}

const forgotPassword = () => {
  uni.showToast({ title: '请联系客服找回', icon: 'none' })
}
</script>
<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5f7 0%, #ffffff 50%, #f8f8f8 100%);
  padding: 80rpx 48rpx 0;
}

.logo-section {
  text-align: center;
  margin-bottom: 80rpx;
  .logo-text {
    display: block;
    font-size: 72rpx;
    font-weight: bold;
    background: linear-gradient(135deg, #ff5777, #ff8a9a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 4rpx;
  }
  .logo-sub {
    display: block;
    font-size: 26rpx;
    color: #bbb;
    margin-top: 12rpx;
    letter-spacing: 2rpx;
  }
}

.form-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 36rpx;
  box-shadow: 0 8rpx 40rpx rgba(255, 87, 119, 0.1);
}

.form-item {
  margin-bottom: 40rpx;
  position: relative;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 16rpx;
  .label-icon { font-size: 28rpx; }
  .label-text { font-size: 28rpx; color: #666; font-weight: 500; }
}

.form-input {
  height: 88rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: #333;
}

.input-placeholder {
  color: #bbb;
  font-size: 28rpx;
}

.password-toggle {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  font-size: 32rpx;
}

.btn-login {
  height: 88rpx;
  background: linear-gradient(135deg, #ff5777, #ff8a9a);
  border-radius: 44rpx;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  letter-spacing: 4rpx;
  border: none;
  margin-top: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 87, 119, 0.3);
}

.form-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16rpx;
  margin-top: 32rpx;
  .divider { color: #ddd; }
  .link-text { font-size: 26rpx; color: #666; }
}

.other-login {
  margin-top: 80rpx;
}
.divider-line {
  display: flex;
  align-items: center;
  gap: 24rpx;
  .line { flex: 1; height: 1rpx; background: #eee; }
  .divider-text { font-size: 24rpx; color: #bbb; }
}
.other-icons {
  display: flex;
  justify-content: center;
  margin-top: 40rpx;
}
.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  .icon {
    width: 88rpx;
    height: 88rpx;
    background: #f0f0f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    color: #07c160;
  }
  .icon-label { font-size: 24rpx; color: #999; }
}
</style>
