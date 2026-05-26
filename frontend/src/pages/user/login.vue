<template>
  <view class="login-page">
    <view class="back-btn" @tap="goBack">
      <text class="back-arrow">‹</text>
    </view>

    <view class="brand">
      <text class="brand-title">FASHION</text>
      <text class="brand-sub">品质生活 从穿搭开始</text>
    </view>

    <view class="form-card">
      <input
        class="form-input"
        v-model="phone"
        type="number"
        maxlength="11"
        placeholder="请输入手机号"
        placeholder-class="input-ph"
      />
      <input
        class="form-input"
        v-model="password"
        type="password"
        placeholder="请输入密码"
        placeholder-class="input-ph"
      />
      <view class="login-btn" @tap="login">
        <text class="login-btn-text">登录</text>
      </view>
      <view class="form-links">
        <text class="form-link" @tap="goRegister">创建账号</text>
        <text class="form-link-divider">·</text>
        <text class="form-link">忘记密码</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { request, setToken } from '@/utils/request'

const phone = ref('')
const password = ref('')

const login = async () => {
  if (!phone.value || !password.value) {
    uni.showToast({ title: '请填写所有字段', icon: 'none' })
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
      uni.showToast({ title: '欢迎回来', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 800)
    }
  } catch (e: any) {
    uni.showToast({ title: e.error || '登录失败', icon: 'none' })
  }
}

const goRegister = () => uni.navigateTo({ url: '/pages/user/register' })
const goBack = () => uni.navigateBack()
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: var(--bg-secondary, #F5F5F5);
  padding: 0 48rpx;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 100rpx;
  left: 32rpx;
  width: 72rpx;
  height: 72rpx;
  background: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.back-arrow {
  font-size: 40rpx;
  color: var(--text-primary, #1A1A1A);
  margin-top: -4rpx;
}

.brand {
  padding-top: 240rpx;
  text-align: center;
  margin-bottom: 64rpx;
}

.brand-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--text-primary, #1A1A1A);
  letter-spacing: 8rpx;
}

.brand-sub {
  display: block;
  font-size: 26rpx;
  color: var(--text-quaternary, #999999);
  margin-top: 16rpx;
}

.form-card {
  background: #FFFFFF;
  border-radius: var(--radius-md, 16rpx);
  padding: 48rpx 32rpx;
}

.form-input {
  width: 100%;
  height: 96rpx;
  background: var(--bg-secondary, #F5F5F5);
  border-radius: var(--radius-sm, 8rpx);
  padding: 0 24rpx;
  font-size: 30rpx;
  color: var(--text-primary, #1A1A1A);
  margin-bottom: 24rpx;
  box-sizing: border-box;
}

.input-ph {
  color: var(--text-quaternary, #999999);
  font-size: 28rpx;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: var(--accent, #C8102E);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8rpx;

  &:active {
    opacity: 0.85;
  }
}

.login-btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: 4rpx;
}

.form-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
  margin-top: 32rpx;
}

.form-link {
  font-size: 24rpx;
  color: var(--text-quaternary, #999999);
}

.form-link-divider {
  font-size: 24rpx;
  color: var(--text-quaternary, #999999);
}
</style>
