<template>
  <view class="register-page">
    <view class="back-btn" @tap="goBack">
      <text class="back-arrow">‹</text>
    </view>

    <view class="brand">
      <text class="brand-title">创建账号</text>
      <text class="brand-sub">注册成为会员</text>
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
        placeholder="至少6位字符"
        placeholder-class="input-ph"
      />
      <input
        class="form-input"
        v-model="nickname"
        type="text"
        placeholder="怎么称呼您（选填）"
        placeholder-class="input-ph"
      />
      <view class="register-btn" @tap="register">
        <text class="register-btn-text">注册</text>
      </view>
      <view class="form-footer">
        <text class="form-link" @tap="goLogin">已有账号？去登录</text>
      </view>
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
  padding-top: 200rpx;
  text-align: center;
  margin-bottom: 56rpx;
}

.brand-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: var(--text-primary, #1A1A1A);
  letter-spacing: 4rpx;
}

.brand-sub {
  display: block;
  font-size: 26rpx;
  color: var(--text-quaternary, #999999);
  margin-top: 12rpx;
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

.register-btn {
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

.register-btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: 4rpx;
}

.form-footer {
  text-align: center;
  margin-top: 28rpx;
}

.form-link {
  font-size: 24rpx;
  color: var(--text-quaternary, #999999);
}
</style>
