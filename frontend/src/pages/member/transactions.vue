<template>
  <view class="tx-page">
    <view class="summary-card">
      <text class="sc-label">当前积分</text>
      <text class="sc-points">{{ memberData?.points || 0 }}</text>
    </view>

    <view class="tx-list" v-if="transactions.length > 0">
      <view v-for="tx in transactions" :key="tx.id" class="tx-item">
        <view class="tx-left">
          <view class="tx-icon-wrap">
            <text class="tx-type-icon">{{ tx.amount > 0 ? '↓' : '↑' }}</text>
          </view>
          <view class="tx-info">
            <text class="tx-desc">{{ tx.description }}</text>
            <text class="tx-time">{{ formatTime(tx.createdAt) }}</text>
          </view>
        </view>
        <view class="tx-right">
          <text class="tx-amount" :class="{ earn: tx.amount > 0, redeem: tx.amount < 0 }">
            {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
          </text>
          <text class="tx-balance">余额 {{ tx.balance }}</text>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-icon">📊</text>
      <text class="empty-text">暂无积分记录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request, getToken } from '@/utils/request'

const memberData = ref<any>(null)
const transactions = ref<any[]>([])

const formatTime = (t: string) => {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
}

const loadData = async () => {
  if (!getToken()) return
  try {
    const [member, txRes] = await Promise.all([
      request('/member/profile', 'GET'),
      request('/member/transactions?limit=50', 'GET')
    ])
    memberData.value = member
    transactions.value = txRes.transactions || []
  } catch (e) { console.error(e) }
}

onShow(() => loadData())
</script>

<style lang="scss" scoped>
.tx-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.summary-card {
  background: #FFFFFF;
  padding: 48rpx 32rpx;
  text-align: center;
}

.sc-label {
  font-size: 22rpx;
  color: #999999;
  display: block;
  margin-bottom: 8rpx;
}

.sc-points {
  font-size: 60rpx;
  font-weight: 700;
  color: #1A1A1A;
  display: block;
}

.tx-list {
  padding: 20rpx 24rpx;
}

.tx-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 12rpx;
}

.tx-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.tx-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tx-type-icon {
  font-size: 28rpx;
  color: #666666;
}

.tx-info {
  display: flex;
  flex-direction: column;
}

.tx-desc {
  font-size: 26rpx;
  color: #1A1A1A;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.tx-time {
  font-size: 22rpx;
  color: #999999;
}

.tx-right {
  text-align: right;
}

.tx-amount {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
}

.tx-amount.earn {
  color: #43A047;
}

.tx-amount.redeem {
  color: #C8102E;
}

.tx-balance {
  font-size: 20rpx;
  color: #999999;
  margin-top: 4rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
}

.empty-icon {
  font-size: 64rpx;
}

.empty-text {
  display: block;
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #999999;
}
</style>
