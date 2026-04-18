<template>
  <view class="user-center">
    <!-- Header -->
    <view class="user-header" @tap="goLogin">
      <image class="avatar" :src="userInfo?.avatar ? userInfo.avatar : '/static/images/default-avatar.png'" />
      <view class="user-info">
        <text class="nickname">{{ userInfo?.nickname || '点击登录' }}</text>
        <text class="phone" v-if="userInfo">{{ userInfo.phone }}</text>
        <text class="login-tip" v-else>登录后享受更多权益</text>
      </view>
      <view class="arrow-icon">›</view>
    </view>

    <!-- VIP Card -->
    <view class="vip-card" v-if="userInfo">
      <view class="vip-left">
        <text class="vip-icon">👑</text>
        <view class="vip-info">
          <text class="vip-name">VIP会员</text>
          <text class="vip-desc">享受专属优惠</text>
        </view>
      </view>
      <view class="vip-right">
        <text class="vip-btn">立即开通</text>
      </view>
    </view>

    <!-- Order Section -->
    <view class="order-section">
      <view class="section-header">
        <text class="section-title">我的订单</text>
        <view class="more" @tap="goOrders()">
          <text>全部订单</text>
          <text class="arrow">›</text>
        </view>
      </view>
      <view class="order-tabs">
        <view v-for="tab in orderTabs" :key="tab.key" class="tab-item" @tap="goOrders(tab.key)">
          <text class="tab-icon">{{ tab.icon }}</text>
          <text class="tab-name">{{ tab.name }}</text>
        </view>
      </view>
    </view>

    <!-- Menu List -->
    <view class="menu-section">
      <view class="menu-item" @tap="goAddress">
        <view class="menu-left">
          <text class="menu-icon">📍</text>
          <text class="menu-text">收货地址</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goMember">
        <view class="menu-left">
          <text class="menu-icon">🎫</text>
          <text class="menu-text">优惠券</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goFavorites">
        <view class="menu-left">
          <text class="menu-icon">❤️</text>
          <text class="menu-text">我的收藏</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goSetting">
        <view class="menu-left">
          <text class="menu-icon">⚙️</text>
          <text class="menu-text">设置</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- Logout -->
    <view class="logout-btn" v-if="isLoggedIn" @tap="logout">
      <text>退出登录</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'

const isLoggedIn = ref(false)
const userInfo = ref<any>(null)
const orderTabs = [
  { key: 'pending', name: '待付款', icon: '📋' },
  { key: 'paid', name: '待发货', icon: '📦' },
  { key: 'shipped', name: '待收货', icon: '🚚' },
  { key: 'completed', name: '已完成', icon: '✅' }
]

const checkLogin = () => {
  const token = uni.getStorageSync('token')
  isLoggedIn.value = !!token
  userInfo.value = uni.getStorageSync('userInfo') || null
}

onShow(() => {
  checkLogin()
})

const goLogin = () => {
  if (!isLoggedIn.value) uni.navigateTo({ url: '/pages/user/login' })
}

const goOrders = (status?: string) => {
  if (!isLoggedIn.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `/pages/order/list${status ? '?status=' + status : ''}` })
}

const goAddress = () => { uni.showToast({ title: '功能开发中', icon: 'none' }) }
const goMember = () => { uni.showToast({ title: '功能开发中', icon: 'none' }) }
const goFavorites = () => { uni.showToast({ title: '功能开发中', icon: 'none' }) }
const goSetting = () => { uni.showToast({ title: '功能开发中', icon: 'none' }) }

const logout = () => {
  uni.removeStorageSync('token')
  uni.removeStorageSync('userInfo')
  isLoggedIn.value = false
  userInfo.value = null
  uni.showToast({ title: '已退出登录', icon: 'none' })
}
</script>
<style lang="scss" scoped>
.user-center { min-height: 100vh; background: #f5f5f5; padding-bottom: 40rpx; }

.user-header {
  display: flex;
  align-items: center;
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, #ff5777, #ff8a9a);
  .avatar { 
    width: 120rpx; 
    height: 120rpx; 
    border-radius: 60rpx; 
    border: 4rpx solid rgba(255,255,255,0.4);
    background: #fff;
  }
  .user-info {
    flex: 1;
    margin-left: 28rpx;
    .nickname { 
      display: block; 
      font-size: 38rpx; 
      font-weight: bold; 
      color: #fff;
    }
    .phone { 
      display: block; 
      font-size: 24rpx; 
      color: rgba(255,255,255,0.85); 
      margin-top: 8rpx;
    }
    .login-tip {
      display: block;
      font-size: 24rpx;
      color: rgba(255,255,255,0.8);
      margin-top: 8rpx;
    }
  }
  .arrow-icon { 
    font-size: 48rpx; 
    color: rgba(255,255,255,0.6);
  }
}

.vip-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
  margin: -20rpx 24rpx 16rpx;
  padding: 28rpx 28rpx;
  border-radius: 16rpx;
  position: relative;
  z-index: 10;
}
.vip-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  .vip-icon { font-size: 48rpx; }
  .vip-name { display: block; font-size: 30rpx; color: #ffd700; font-weight: bold; }
  .vip-desc { display: block; font-size: 22rpx; color: #bbb; margin-top: 4rpx; }
}
.vip-right {
  .vip-btn {
    background: linear-gradient(135deg, #ffd700, #ffb700);
    color: #1a1a1a;
    font-size: 24rpx;
    font-weight: bold;
    padding: 12rpx 24rpx;
    border-radius: 24rpx;
  }
}

.order-section {
  background: #fff;
  margin: 0 24rpx 16rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  .section-title { font-size: 32rpx; font-weight: 600; color: #333; }
  .more { display: flex; align-items: center; font-size: 24rpx; color: #999; .arrow { font-size: 28rpx; margin-left: 4rpx; } }
}
.order-tabs { display: flex; justify-content: space-around; }
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  .tab-icon { font-size: 44rpx; }
  .tab-name { font-size: 24rpx; color: #666; }
}

.menu-section {
  background: #fff;
  margin: 0 24rpx 16rpx;
  border-radius: 16rpx;
  overflow: hidden;
}
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  &:last-child { border-bottom: none; }
}
.menu-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  .menu-icon { font-size: 36rpx; }
  .menu-text { font-size: 28rpx; color: #333; }
}
.menu-arrow { color: #ccc; font-size: 32rpx; }

.logout-btn {
  background: #fff;
  margin: 0 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  text-align: center;
  text { font-size: 28rpx; color: #ff5777; }
}
</style>
