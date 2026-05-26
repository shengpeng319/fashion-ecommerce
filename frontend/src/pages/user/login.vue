<template>
  <view class="login-page">
    <view class="login-bg"></view>
    <view class="login-card">
      <view class="logo-area">
        <text class="logo-text">FASHION</text>
        <view class="logo-line"></view>
        <text class="logo-sub">Milano</text>
      </view>

      <view class="form-area">
        <view class="input-group">
          <text class="input-label">手机号</text>
          <input class="input-field" v-model="phone" type="number" maxlength="11" placeholder="请输入手机号" placeholder-class="ph" />
        </view>
        <view class="input-group">
          <text class="input-label">密码</text>
          <input class="input-field" v-model="password" type="password" placeholder="请输入密码" placeholder-class="ph" />
        </view>

        <view class="btn-login" @tap="login">
          <text>登录</text>
        </view>

        <view class="form-links">
          <text class="link" @tap="goRegister">创建账号</text>
          <text class="link-divider">·</text>
          <text class="link">忘记密码</text>
        </view>
      </view>
    </view>

    <!-- Back link -->
    <view class="back-link" @tap="goBack">
      <text>← 返回</text>
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
  position: relative;
}
.login-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 55vh;
  background: var(--color-dark);
}
.login-card {
  position: relative;
  z-index: 1;
  padding-top: 120rpx;
  margin: 0 40rpx;
}

.logo-area {
  text-align: center;
  margin-bottom: 64rpx;
}
.logo-text {
  font-family: var(--font-display);
  font-size: 64rpx;
  font-weight: 700;
  color: var(--color-gold);
  letter-spacing: 12rpx;
}
.logo-line {
  width: 48rpx;
  height: 2rpx;
  background: var(--color-gold);
  margin: 24rpx auto;
}
.logo-sub {
  font-family: var(--font-display);
  font-size: 24rpx;
  font-style: italic;
  color: var(--color-text-muted);
  letter-spacing: 8rpx;
}

.form-area {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  padding: 48rpx 36rpx;
  box-shadow: var(--shadow-lg);
}
.input-group {
  margin-bottom: 36rpx;
}
.input-label {
  display: block;
  font-size: 20rpx;
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 3rpx;
  margin-bottom: 12rpx;
}
.input-field {
  height: 88rpx;
  background: var(--color-surface);
  border: 1rpx solid var(--color-border-light);
  border-radius: var(--radius-sm);
  padding: 0 24rpx;
  font-size: 30rpx;
  color: var(--color-text);
  font-family: var(--font-body);
}
.ph {
  color: var(--color-text-muted);
  font-size: 26rpx;
  font-weight: 300;
}

.btn-login {
  height: 88rpx;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8rpx;
  transition: all var(--transition-base);
  &:active { opacity: 0.85; }
  text {
    font-size: 28rpx;
    font-weight: 600;
    color: #fff;
    letter-spacing: 6rpx;
  }
}
.form-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8rpx;
  margin-top: 32rpx;
  .link { font-size: 24rpx; color: var(--color-text-muted); }
  .link-divider { color: var(--color-border); }
}

.back-link {
  text-align: center;
  margin-top: 40rpx;
  font-size: 24rpx;
  color: var(--color-text-muted);
}
</style>
