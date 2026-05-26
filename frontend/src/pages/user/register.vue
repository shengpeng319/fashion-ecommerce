<template>
  <view class="register-page">
    <view class="register-bg"></view>
    <view class="register-card">
      <view class="logo-area">
        <text class="logo-text">加入我们</text>
        <view class="logo-line"></view>
        <text class="logo-sub">创建您的账号</text>
      </view>

      <view class="form-area">
        <view class="input-group">
          <text class="input-label">手机号</text>
          <input class="input-field" v-model="phone" type="number" maxlength="11" placeholder="请输入手机号" placeholder-class="ph" />
        </view>
        <view class="input-group">
          <text class="input-label">密码</text>
          <input class="input-field" v-model="password" type="password" placeholder="至少6位字符" placeholder-class="ph" />
        </view>
        <view class="input-group">
          <text class="input-label">昵称（选填）</text>
          <input class="input-field" v-model="nickname" type="text" placeholder="怎么称呼您" placeholder-class="ph" />
        </view>

        <view class="btn-register" @tap="register">
          <text>创建账号</text>
        </view>

        <view class="form-footer">
          <text class="link" @tap="goLogin">已有账号？去登录</text>
        </view>
      </view>
    </view>

    <view class="back-link" @tap="goBack">
      <text>← Back</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { request } from '@/utils/request'

const phone = ref('')
const password = ref('')
const nickname = ref('')

const register = async () => {
  if (!phone.value || !password.value) {
    uni.showToast({ title: '请填写必填字段', icon: 'none' })
    return
  }
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }
  if (password.value.length < 6) {
    uni.showToast({ title: '密码至少需要6位字符', icon: 'none' })
    return
  }
  try {
    const res: any = await request('/auth/register', 'POST', {
      phone: phone.value,
      password: password.value,
      nickname: nickname.value || phone.value.slice(-4)
    })
    if (res.success) {
      uni.showToast({ title: '注册成功！请登录' })
      setTimeout(() => uni.navigateTo({ url: '/pages/user/login' }), 1000)
    }
  } catch (e: any) {
    uni.showToast({ title: e.error || '注册失败', icon: 'none' })
  }
}

const goLogin = () => uni.navigateTo({ url: '/pages/user/login' })
const goBack = () => uni.navigateBack()
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  position: relative;
}
.register-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 45vh;
  background: var(--color-dark);
}
.register-card {
  position: relative;
  z-index: 1;
  padding-top: 80rpx;
  margin: 0 40rpx;
}

.logo-area {
  text-align: center;
  margin-bottom: 56rpx;
}
.logo-text {
  font-family: var(--font-display);
  font-size: 48rpx;
  font-weight: 700;
  color: var(--color-gold);
  letter-spacing: 10rpx;
}
.logo-line {
  width: 40rpx;
  height: 2rpx;
  background: var(--color-gold);
  margin: 20rpx auto;
}
.logo-sub {
  font-size: 24rpx;
  color: var(--color-text-muted);
  font-weight: 300;
  letter-spacing: 2rpx;
}

.form-area {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  padding: 48rpx 36rpx;
  box-shadow: var(--shadow-lg);
}
.input-group {
  margin-bottom: 32rpx;
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
}
.ph {
  color: var(--color-text-muted);
  font-size: 26rpx;
  font-weight: 300;
}

.btn-register {
  height: 88rpx;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8rpx;
  &:active { opacity: 0.85; }
  text {
    font-size: 28rpx;
    font-weight: 600;
    color: #fff;
    letter-spacing: 6rpx;
  }
}
.form-footer {
  text-align: center;
  margin-top: 28rpx;
  .link { font-size: 24rpx; color: var(--color-text-muted); }
}

.back-link {
  text-align: center;
  margin-top: 32rpx;
  font-size: 24rpx;
  color: var(--color-text-muted);
}
</style>
