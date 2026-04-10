<template>
  <view class="register-page">
    <view class="logo">
      <text class="title">时尚女装</text>
      <text class="subtitle">Fashion Boutique</text>
    </view>
    <view class="form">
      <view class="form-item">
        <text class="label">手机号</text>
        <input v-model="phone" type="number" maxlength="11" placeholder="请输入手机号" />
      </view>
      <view class="form-item">
        <text class="label">密码</text>
        <input v-model="password" type="password" placeholder="请输入密码（至少6位）" />
      </view>
      <view class="form-item">
        <text class="label">昵称</text>
        <input v-model="nickname" type="text" placeholder="请输入昵称（选填）" />
      </view>
      <button type="primary" class="btn-register" @tap="register">注册</button>
      <view class="links">
        <text @tap="goLogin">已有账号？去登录</text>
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
    uni.showToast({ title: '请填写完整', icon: 'none' })
    return
  }
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }
  if (password.value.length < 6) {
    uni.showToast({ title: '密码至少6位', icon: 'none' })
    return
  }
  try {
    const res: any = await request('/auth/register', 'POST', { 
      phone: phone.value, 
      password: password.value,
      nickname: nickname.value || phone.value.slice(-4)
    })
    if (res.success) {
      uni.showToast({ title: '注册成功，请登录' })
      setTimeout(() => uni.navigateTo({ url: '/pages/user/login' }), 1000)
    }
  } catch (e: any) {
    uni.showToast({ title: e.error || '注册失败', icon: 'none' })
  }
}

const goLogin = () => {
  uni.navigateTo({ url: '/pages/user/login' })
}
</script>
<style lang="scss" scoped>
.register-page { min-height: 100vh; background: #fff; padding: 100rpx 48rpx; }
.logo { text-align: center; margin-bottom: 80rpx; }
.title { font-size: 56rpx; font-weight: bold; color: #ff5777; }
.subtitle { font-size: 28rpx; color: #999; display: block; margin-top: 8rpx; }
.form { }
.form-item { margin-bottom: 32rpx; }
.label { font-size: 28rpx; color: #666; display: block; margin-bottom: 16rpx; }
.form-item input { height: 88rpx; background: #f8f8f8; border-radius: 12rpx; padding: 0 24rpx; font-size: 28rpx; }
.btn-register { height: 88rpx; background: linear-gradient(135deg, #ff5777, #ff8a9a); border-radius: 44rpx; color: #fff; font-size: 32rpx; line-height: 88rpx; border: none; margin-top: 20rpx; }
.links { display: flex; justify-content: center; margin-top: 32rpx; }
.links text { color: #ff5777; font-size: 28rpx; }
</style>
