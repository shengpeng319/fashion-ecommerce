<template>
  <view class="member-page">
    <!-- Header Card -->
    <view class="member-header" v-if="memberData">
      <view class="mh-badge-wrap">
        <view class="mh-badge">{{ memberData.levelName || '轻会员' }}</view>
      </view>
      <view class="mh-points-row">
        <text class="mh-points-value">{{ memberData.points || 0 }}</text>
        <text class="mh-points-label">积分余额</text>
      </view>
      <text class="mh-desc">1积分=1元，抵扣无上限</text>
    </view>

    <!-- Upgradable Info -->
    <view class="upgrade-cta" v-if="showUpgrade" @tap="goUpgrade">
      <text class="ucta-text">升级会员，解锁更多权益</text>
      <text class="ucta-arrow">→</text>
    </view>

    <!-- Level Card -->
    <view class="section-card" v-if="levelConfig">
      <view class="sc-title">当前权益</view>
      <view class="benefit-list">
        <view v-for="b in currentBenefits" :key="b" class="benefit-item">
          <text class="benefit-icon">◆</text>
          <text class="benefit-text">{{ b }}</text>
        </view>
      </view>
    </view>

    <!-- Quick Actions -->
    <view class="section-card actions-card">
      <view class="action-item" @tap="goTransactions">
        <text class="action-icon">▦</text>
        <text class="action-label">积分明细</text>
        <text class="action-arrow">›</text>
      </view>
      <view class="action-item" @tap="goReferral">
        <text class="action-icon">☆</text>
        <text class="action-label">邀请好友</text>
        <text class="action-arrow">›</text>
      </view>
      <view class="action-item" @tap="goUpgrade">
        <text class="action-icon">◆</text>
        <text class="action-label">会员升级</text>
        <text class="action-arrow">›</text>
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
    // Add level name
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
  background: var(--color-bg);
  padding-bottom: 40rpx;
}

.member-header {
  background: linear-gradient(135deg, var(--color-dark), #2D1A1F);
  padding: 64rpx 32rpx 48rpx;
  text-align: center;
  position: relative;
  overflow: hidden;
  &::after {
    content: '◆ ◆ ◆';
    position: absolute;
    top: 20rpx;
    right: 32rpx;
    font-size: 20rpx;
    color: rgba(201,169,110,0.12);
    letter-spacing: 8rpx;
  }
}
.mh-badge-wrap {
  margin-bottom: 28rpx;
}
.mh-badge {
  display: inline-block;
  padding: 8rpx 28rpx;
  border: 1rpx solid var(--color-gold);
  border-radius: 24rpx;
  font-size: 24rpx;
  color: var(--color-gold);
  font-weight: 500;
  letter-spacing: 4rpx;
}
.mh-points-row {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  margin-bottom: 20rpx;
}
.mh-points-value {
  font-family: var(--font-display);
  font-size: 72rpx;
  font-weight: 700;
  color: white;
  letter-spacing: 2rpx;
}
.mh-points-label {
  font-size: 22rpx;
  color: var(--color-text-muted);
  letter-spacing: 4rpx;
}
.mh-desc {
  font-size: 22rpx;
  color: rgba(255,255,255,0.3);
}

.upgrade-cta {
  margin: 24rpx;
  padding: 28rpx;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1rpx solid rgba(201,169,110,0.2);
  &:active { opacity: 0.7; }
}
.ucta-text {
  font-size: 28rpx;
  color: var(--color-primary);
  font-weight: 500;
}
.ucta-arrow {
  font-size: 32rpx;
  color: var(--color-gold);
}

.section-card {
  background: var(--color-card);
  margin: 0 24rpx 24rpx;
  border-radius: var(--radius-xl);
  padding: 28rpx;
}
.sc-title {
  font-family: var(--font-display);
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text);
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
.benefit-icon {
  font-size: 16rpx;
  color: var(--color-gold);
}
.benefit-text {
  font-size: 24rpx;
  color: var(--color-text-secondary);
}

.actions-card {
  padding: 0;
  overflow: hidden;
}
.action-item {
  display: flex;
  align-items: center;
  padding: 32rpx 28rpx;
  border-bottom: 1rpx solid var(--color-divider);
  &:last-child { border-bottom: none; }
  &:active { background: var(--color-surface); }
}
.action-icon {
  font-size: 28rpx;
  color: var(--color-gold);
  margin-right: 20rpx;
}
.action-label {
  flex: 1;
  font-size: 28rpx;
  color: var(--color-text);
  font-weight: 400;
}
.action-arrow {
  font-size: 28rpx;
  color: var(--color-text-muted);
}
</style>
