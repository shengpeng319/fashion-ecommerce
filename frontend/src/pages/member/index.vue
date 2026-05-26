<template>
  <view class="member-page">
    <view class="member-header" v-if="memberData">
      <view class="mh-level">{{ memberData.levelName || '轻会员' }}</view>
      <view class="mh-stats-row">
        <view class="mh-stat">
          <text class="mh-stat-value">{{ memberData.points || 0 }}</text>
          <text class="mh-stat-label">积分余额</text>
        </view>
        <view class="mh-stat">
          <text class="mh-stat-value">{{ memberData.totalSpent || 0 }}</text>
          <text class="mh-stat-label">累计消费</text>
        </view>
      </view>
      <text class="mh-desc">1积分=1元，抵扣无上限</text>
    </view>

    <view class="upgrade-banner" v-if="showUpgrade" @tap="goUpgrade">
      <text class="ub-text">升级会员，解锁更多权益</text>
      <text class="ub-arrow">></text>
    </view>

    <view class="section-card" v-if="levelConfig">
      <view class="sc-title">当前权益</view>
      <view class="benefit-list">
        <view v-for="b in currentBenefits" :key="b" class="benefit-item">
          <text class="benefit-dot">·</text>
          <text class="benefit-text">{{ b }}</text>
        </view>
      </view>
    </view>

    <view class="section-card actions-card">
      <view class="action-item" @tap="goUpgrade">
        <text class="action-icon">⬆️</text>
        <text class="action-label">会员升级</text>
        <text class="action-arrow">></text>
      </view>
      <view class="action-item" @tap="goTransactions">
        <text class="action-icon">📊</text>
        <text class="action-label">积分明细</text>
        <text class="action-arrow">></text>
      </view>
      <view class="action-item" @tap="goReferral">
        <text class="action-icon">👥</text>
        <text class="action-label">邀请好友</text>
        <text class="action-arrow">></text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request, getToken } from '@/utils/request'

const memberData = ref<any>(null)
const levelConfig = ref<any>(null)
const allLevels = ref<any[]>([])

const currentBenefits = computed(() => {
  if (!levelConfig.value?.benefits) return ['消费累计积分']
  try { return JSON.parse(levelConfig.value.benefits) } catch { return [levelConfig.value.benefits] }
})

const showUpgrade = computed(() => {
  if (!levelConfig.value || !allLevels.value.length) return false
  const currentOrder = levelConfig.value.sortOrder
  return allLevels.value.some((l: any) => l.sortOrder > currentOrder)
})

const loadData = async () => {
  if (!getToken()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/user/login' }), 1000)
    return
  }
  try {
    const [member, levels] = await Promise.all([
      request('/member/profile', 'GET'),
      request('/member/levels', 'GET')
    ])
    memberData.value = member
    allLevels.value = levels || []
    const currentLevelKey = member.level || 'LIGHT'
    levelConfig.value = allLevels.value.find((l: any) => l.key === currentLevelKey)
    if (levelConfig.value) {
      memberData.value.levelName = levelConfig.value.name
    }
  } catch (e) {
    console.error('member load error', e)
  }
}

onShow(() => loadData())

const goUpgrade = () => uni.navigateTo({ url: '/pages/member/upgrade' })
const goTransactions = () => uni.navigateTo({ url: '/pages/member/transactions' })
const goReferral = () => uni.navigateTo({ url: '/pages/member/referral' })
</script>

<style lang="scss" scoped>
.member-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 40rpx;
}

.member-header {
  background: #FFFFFF;
  padding: 40rpx 32rpx;
  text-align: center;
}

.mh-level {
  display: inline-block;
  padding: 8rpx 28rpx;
  background: #FFF0F0;
  color: #C8102E;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 600;
  margin-bottom: 32rpx;
}

.mh-stats-row {
  display: flex;
  justify-content: center;
  gap: 80rpx;
  margin-bottom: 20rpx;
}

.mh-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mh-stat-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #1A1A1A;
}

.mh-stat-label {
  font-size: 22rpx;
  color: #999999;
  margin-top: 4rpx;
}

.mh-desc {
  font-size: 22rpx;
  color: #999999;
}

.upgrade-banner {
  margin: 20rpx 24rpx 0;
  padding: 24rpx 28rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1rpx solid #EEEEEE;

  &:active {
    background: #FAFAFA;
  }
}

.ub-text {
  font-size: 28rpx;
  color: #C8102E;
  font-weight: 500;
}

.ub-arrow {
  font-size: 28rpx;
  color: #999999;
}

.section-card {
  background: #FFFFFF;
  margin: 20rpx 24rpx 0;
  border-radius: 16rpx;
  padding: 28rpx;
}

.sc-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 24rpx;
}

.benefit-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-basis: calc(50% - 8rpx);
}

.benefit-dot {
  font-size: 24rpx;
  color: #C8102E;
  font-weight: 700;
}

.benefit-text {
  font-size: 24rpx;
  color: #666666;
}

.actions-card {
  padding: 0;
  overflow: hidden;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 28rpx;
  border-bottom: 1rpx solid #F0F0F0;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #FAFAFA;
  }
}

.action-icon {
  font-size: 28rpx;
  margin-right: 20rpx;
}

.action-label {
  flex: 1;
  font-size: 28rpx;
  color: #1A1A1A;
}

.action-arrow {
  font-size: 28rpx;
  color: #999999;
}
</style>
