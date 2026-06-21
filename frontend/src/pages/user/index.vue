<template>
  <view class="user-page">
    <view class="user-header">
      <view class="header-top">
        <view class="avatar-circle" :style="{ background: userInfo?.avatar ? '#FFFFFF' : '#F5F5F5' }">
          <image v-if="userInfo?.avatar" :src="userInfo.avatar" class="avatar-img" mode="aspectFill" />
          <text v-else class="avatar-letter">{{ isLoggedIn ? (userInfo?.nickname || 'U').charAt(0).toUpperCase() : '?' }}</text>
        </view>
        <view class="header-info" v-if="isLoggedIn">
          <text class="header-name">{{ userInfo?.nickname || '用户' }}</text>
          <text class="header-sub">{{ userInfo?.phone || '' }}</text>
        </view>
        <view class="header-info" v-else>
          <text class="header-name">未登录</text>
          <text class="header-sub">登录后享受更多服务</text>
        </view>
        <view class="header-badge" v-if="isLoggedIn && memberData" @tap.stop="goMember">{{ memberData.levelName || '会员' }}</view>
      </view>
      <view class="login-btn" v-if="!isLoggedIn" @tap="goLogin">
        <text class="login-btn-text">登录/注册</text>
      </view>
    </view>

    <view class="section-card" v-if="isLoggedIn">
      <view class="sc-header" @tap="goOrders()">
        <text class="sc-title">我的订单</text>
        <view class="sc-more">
          <text>查看全部</text>
          <text class="sc-arrow">></text>
        </view>
      </view>
      <view class="order-icons">
        <view v-for="tab in orderTabs" :key="tab.key" class="oi-item" @tap="goOrders(tab.key)">
          <text class="oi-icon">{{ tab.icon }}</text>
          <text class="oi-label">{{ tab.label }}</text>
        </view>
      </view>
    </view>

    <view class="section-card menu-list">
      <view v-for="item in menuItems" :key="item.key" class="menu-item" @tap="item.action">
        <text class="menu-icon">{{ item.icon }}</text>
        <text class="menu-label">{{ item.label }}</text>
        <text class="menu-arrow">></text>
      </view>
      <view v-if="isLoggedIn" class="menu-item menu-item-divider" @tap="logout">
        <text class="menu-icon">🚪</text>
        <text class="menu-label logout-text">退出登录</text>
        <text class="menu-arrow">></text>
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
  { key: 'pending', label: '待付款', icon: '💳' },
  { key: 'paid', label: '待发货', icon: '📦' },
  { key: 'shipped', label: '运输中', icon: '🚚' },
  { key: 'completed', label: '已完成', icon: '✅' }
]

const menuItems = [
  { key: 'member', label: '会员中心', icon: '👑', action: () => goPage('/pages/member/index') },
  { key: 'address', label: '收货地址', icon: '📍', action: () => goPage('/pages/address/list') },
  { key: 'coupon', label: '优惠券', icon: '🎫', action: () => goPage('/pages/address/list') },
  { key: 'fav', label: '心愿单', icon: '❤️', action: () => goPage('/pages/address/list') },
  { key: 'settings', label: '设置', icon: '⚙️', action: () => goPage('/pages/address/list') }
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
  background: var(--bg-primary, #FAFAF8);
  padding-bottom: 40rpx;
}

.user-header {
  background: var(--bg-card, #FFFFFF);
  padding: 0 var(--space-4, 32rpx) var(--space-4, 32rpx);
  border-radius: 0 0 var(--radius-lg, 32rpx) var(--radius-lg, 32rpx);
  box-shadow: var(--shadow-sm, 0 2rpx 8rpx rgba(28,27,26,0.04), 0 1rpx 2rpx rgba(28,27,26,0.02));
}

.header-top {
  display: flex;
  align-items: center;
  padding-top: var(--space-3, 24rpx);
}

.avatar-circle {
  width: 128rpx;
  height: 128rpx;
  border-radius: var(--radius-full, 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 3rpx solid var(--border, #E8E2DC);
}

.avatar-img {
  width: 128rpx;
  height: 128rpx;
}

.avatar-letter {
  font-size: 48rpx;
  color: var(--text-tertiary, #7A7370);
  font-weight: var(--fw-medium, 500);
}

.header-info {
  flex: 1;
  margin-left: var(--space-3, 24rpx);
}

.header-name {
  display: block;
  font-size: 36rpx;
  font-weight: var(--fw-semibold, 600);
  color: var(--text-primary, #1C1B1A);
  letter-spacing: 0.5rpx;
}

.header-sub {
  display: block;
  font-size: 24rpx;
  color: var(--text-tertiary, #7A7370);
  margin-top: 6rpx;
}

.header-badge {
  background: var(--accent, #B85C38);
  color: #FFFFFF;
  font-size: 20rpx;
  font-weight: var(--fw-medium, 500);
  padding: 6rpx 20rpx;
  border-radius: var(--radius-full, 9999rpx);
  margin-left: 12rpx;
  flex-shrink: 0;
  letter-spacing: 1rpx;
}

.login-btn {
  margin-top: var(--space-3, 24rpx);
  height: 88rpx;
  background: var(--accent, #B85C38);
  border-radius: var(--radius-full, 9999rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast, 200ms cubic-bezier(0.16,1,0.3,1));
}

.login-btn:active {
  opacity: 0.85;
  transform: scale(0.98);
}

.login-btn-text {
  font-size: 28rpx;
  font-weight: var(--fw-semibold, 600);
  color: #FFFFFF;
  letter-spacing: 2rpx;
}

.section-card {
  background: var(--bg-card, #FFFFFF);
  margin: var(--space-2, 16rpx) var(--space-3, 24rpx) 0;
  border-radius: var(--radius-md, 20rpx);
  padding: var(--space-4, 28rpx);
  box-shadow: var(--shadow-sm, 0 2rpx 8rpx rgba(28,27,26,0.04), 0 1rpx 2rpx rgba(28,27,26,0.02));
}

.sc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4, 28rpx);
}

.sc-title {
  font-size: 32rpx;
  font-weight: var(--fw-medium, 500);
  color: var(--text-primary, #1C1B1A);
}

.sc-more {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 24rpx;
  color: var(--text-quaternary, #A8A29E);
}

.sc-arrow {
  font-size: 24rpx;
  color: var(--text-quaternary, #A8A29E);
}

.order-icons {
  display: flex;
  justify-content: space-around;
}

.oi-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  transition: opacity var(--transition-fast);
  &:active { opacity: 0.6; }
}

.oi-icon {
  font-size: 40rpx;
}

.oi-label {
  font-size: 22rpx;
  color: var(--text-secondary, #4A4744);
}

.menu-list {
  padding: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  height: 96rpx;
  padding: 0 var(--space-4, 28rpx);
  border-bottom: 1rpx solid var(--divider, #F0EBE5);
  transition: background var(--transition-fast);

  &:active {
    background: var(--bg-secondary, #F5F2EE);
  }

  &:last-child {
    border-bottom: none;
  }
}

.menu-item-divider {
  border-top: 16rpx solid var(--bg-secondary, #F5F2EE);
  margin-top: 8rpx;
}

.menu-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  width: 40rpx;
  text-align: center;
}

.menu-label {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-primary, #1C1B1A);
  font-weight: var(--fw-regular, 400);
}

.logout-text {
  color: var(--accent, #B85C38) !important;
}

.menu-arrow {
  font-size: 28rpx;
  color: var(--text-quaternary, #A8A29E);
}
</style>
