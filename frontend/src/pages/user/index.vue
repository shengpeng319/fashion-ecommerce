<template>
  <view class="user-page">
    <!-- Header -->
    <view class="user-header" @tap="goLogin">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="avatar-circle" :class="{ logged: isLoggedIn }">
          <text class="avatar-letter">{{ isLoggedIn ? (userInfo?.nickname || 'U').charAt(0).toUpperCase() : '?' }}</text>
        </view>
        <view class="header-info">
          <text class="header-name">{{ userInfo?.nickname || '请登录' }}</text>
          <text class="header-sub">{{ userInfo?.phone || '发现独家精品系列' }}</text>
        </view>
        <view class="header-badge" v-if="isLoggedIn && memberData" @tap.stop="goMember">{{ memberData.levelName || '会员' }}</view>
        <text class="header-arrow">›</text>
      </view>
    </view>

    <!-- Member Card -->
    <view class="vip-card" v-if="isLoggedIn" @tap="goMember">
      <view class="vip-pattern">◆ ◆ ◆ ◆ ◆</view>
      <view class="vip-body">
        <view class="vip-left">
          <text class="vip-tier">{{ memberData?.levelName || '轻会员' }}</text>
          <text class="vip-tier-sub">{{ memberData?.points || 0 }} 积分 · 点击查看详情</text>
        </view>
        <view class="vip-right">
          <text class="vip-cta">会员中心</text>
        </view>
      </view>
    </view>

    <!-- Orders -->
    <view class="section-card">
      <view class="sc-header" @tap="goOrders()">
        <text class="sc-title">我的订单</text>
        <view class="sc-more">
          <text>查看全部</text>
          <text class="sc-arrow">→</text>
        </view>
      </view>
      <view class="order-icons">
        <view v-for="tab in orderTabs" :key="tab.key" class="oi-item" @tap="goOrders(tab.key)">
          <text class="oi-icon">{{ tab.icon }}</text>
          <text class="oi-label">{{ tab.label }}</text>
        </view>
      </view>
    </view>

    <!-- Menu -->
    <view class="section-card menu-list">
      <view v-for="item in menuItems" :key="item.key" class="menu-item" @tap="item.action">
        <text class="menu-icon">{{ item.icon }}</text>
        <text class="menu-label">{{ item.label }}</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- Logout -->
    <view class="logout-area" v-if="isLoggedIn">
      <view class="logout-btn" @tap="logout">
        <text>退出登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

const isLoggedIn = ref(false)
const userInfo = ref<any>(null)
const memberData = ref<any>(null)

const orderTabs = [
  { key: 'pending', label: '待付款', icon: '●' },
  { key: 'paid', label: '待发货', icon: '◐' },
  { key: 'shipped', label: '运输中', icon: '◑' },
  { key: 'completed', label: '已完成', icon: '○' }
]

const menuItems = [
  { key: 'member', label: '会员中心', icon: '◆', action: () => goPage('/pages/member/index') },
  { key: 'address', label: '收货地址', icon: '▣', action: () => goPage('/pages/address/list') },
  { key: 'coupon', label: '优惠券', icon: '▢', action: () => goPage('/pages/address/list') },
  { key: 'fav', label: '心愿单', icon: '♡', action: () => goPage('/pages/address/list') },
  { key: 'settings', label: '设置', icon: '◎', action: () => goPage('/pages/address/list') }
]

const checkLogin = () => {
  const token = uni.getStorageSync('token')
  isLoggedIn.value = !!token
  userInfo.value = uni.getStorageSync('userInfo') || null
}

const loadMember = async () => {
  if (!isLoggedIn.value) return
  try {
    const [member, levels] = await Promise.all([
      request('/member/profile', 'GET'),
      request('/member/levels', 'GET')
    ])
    memberData.value = member
    const levelConfig = (levels || []).find((l: any) => l.key === member.level)
    if (levelConfig) {
      memberData.value.levelName = levelConfig.name
    }
  } catch (e) {}
}

onShow(() => {
  checkLogin()
  if (isLoggedIn.value) loadMember()
})

const goLogin = () => {
  if (!isLoggedIn.value) uni.navigateTo({ url: '/pages/user/login' })
}

const goMember = () => {
  uni.navigateTo({ url: '/pages/member/index' })
}

const goOrders = (status?: string) => {
  if (!isLoggedIn.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `/pages/order/list${status ? '?status=' + status : ''}` })
}

const goPage = (url: string) => {
  if (!isLoggedIn.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.navigateTo({ url })
}

const logout = () => {
  uni.removeStorageSync('token')
  uni.removeStorageSync('userInfo')
  isLoggedIn.value = false
  userInfo.value = null
  uni.showToast({ title: '已退出登录', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.user-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 40rpx;
}

// Header
.user-header {
  position: relative;
  overflow: hidden;
}
.header-bg {
  height: 320rpx;
  background: var(--color-dark);
}
.header-content {
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  margin-top: -180rpx;
}
.avatar-circle {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-dark));
  border: 4rpx solid rgba(201, 169, 110, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  &.logged { background: var(--color-gold); }
}
.avatar-letter {
  font-family: var(--font-display);
  font-size: 52rpx;
  color: #fff;
  font-weight: 600;
}
.header-info {
  flex: 1;
  margin-left: 28rpx;
  padding-bottom: 40rpx;
}
.header-name {
  display: block;
  font-family: var(--font-display);
  font-size: 36rpx;
  font-weight: 600;
  color: var(--color-text-inverse);
  margin-top: 80rpx;
}
.header-sub {
  display: block;
  font-size: 22rpx;
  color: var(--color-text-muted);
  margin-top: 8rpx;
  font-weight: 300;
}
.header-arrow {
  font-size: 48rpx;
  color: var(--color-text-muted);
  padding-bottom: 40rpx;
}

.header-badge {
  background: var(--color-gold);
  color: var(--color-dark);
  font-size: 20rpx;
  font-weight: 600;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  margin-right: 12rpx;
  margin-bottom: 40rpx;
  letter-spacing: 1rpx;
}

// VIP Card
.vip-card {
  margin: -20rpx 24rpx 24rpx;
  padding: 32rpx 28rpx;
  background: linear-gradient(135deg, var(--color-dark), var(--color-dark-surface));
  border: 1rpx solid rgba(201, 169, 110, 0.15);
  border-radius: var(--radius-xl);
  position: relative;
  z-index: 5;
  overflow: hidden;
}
.vip-pattern {
  position: absolute;
  top: 8rpx;
  right: 24rpx;
  font-size: 20rpx;
  color: rgba(201, 169, 110, 0.15);
  letter-spacing: 4rpx;
}
.vip-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}
.vip-tier {
  display: block;
  font-family: var(--font-display);
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-gold);
  letter-spacing: 3rpx;
}
.vip-tier-sub {
  display: block;
  font-size: 20rpx;
  color: var(--color-text-muted);
  margin-top: 4rpx;
}
.vip-cta {
  font-size: 20rpx;
  color: var(--color-gold);
  border: 1rpx solid var(--color-gold);
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
  font-weight: 500;
  letter-spacing: 2rpx;
}

// Section Card
.section-card {
  background: var(--color-card);
  margin: 0 24rpx 24rpx;
  border-radius: var(--radius-xl);
  padding: 28rpx;
}
.sc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}
.sc-title {
  font-family: var(--font-display);
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text);
}
.sc-more {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 24rpx;
  color: var(--color-text-muted);
}
.sc-arrow {
  color: var(--color-primary);
  font-size: 24rpx;
}

// Order Icons
.order-icons {
  display: flex;
  justify-content: space-around;
}
.oi-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}
.oi-icon {
  font-size: 40rpx;
  color: var(--color-text);
}
.oi-label {
  font-size: 22rpx;
  color: var(--color-text-secondary);
  font-weight: 400;
}

// Menu List
.menu-list {
  padding: 0;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx 28rpx;
  border-bottom: 1rpx solid var(--color-divider);
  &:last-child { border-bottom: none; }
}
.menu-icon {
  font-size: 28rpx;
  color: var(--color-primary);
  width: 48rpx;
  text-align: center;
}
.menu-label {
  flex: 1;
  font-size: 28rpx;
  color: var(--color-text);
  font-weight: 400;
}
.menu-arrow {
  font-size: 32rpx;
  color: var(--color-text-muted);
  font-weight: 300;
}

// Logout
.logout-area {
  padding: 40rpx 24rpx;
}
.logout-btn {
  border: 1rpx solid var(--color-border);
  padding: 24rpx;
  text-align: center;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  &:active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    text { color: #fff; }
  }
  text {
    font-size: 26rpx;
    font-weight: 500;
    color: var(--color-text-secondary);
    letter-spacing: 4rpx;
  }
}
</style>
