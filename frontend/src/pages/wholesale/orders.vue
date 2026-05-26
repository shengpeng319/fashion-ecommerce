<template>
  <view class="wo-list-page">
    <view class="tabs">
      <view v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: currentTab === tab.key }" @tap="currentTab = tab.key">
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <view class="orders">
      <view v-for="order in orders" :key="order.id" class="order-card">
        <view class="oc-hd">
          <text class="oc-no">{{ order.orderNo }}</text>
          <text class="oc-status">{{ order.statusText }}</text>
        </view>
        <text class="oc-summary">{{ order.totalQty }} 件商品 · 合计 ¥{{ order.totalAmount }}</text>
        <text class="oc-date">{{ order.createdAt }}</text>
      </view>
      <view v-if="orders.length === 0" class="empty">
        <text class="empty-icon">◇</text>
        <text class="empty-text">暂无订单</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tabs = [
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已驳回' }
]
const currentTab = ref('pending')
const orders = ref<any[]>([])
</script>

<style lang="scss" scoped>
.wo-list-page { min-height: 100vh; background: var(--color-bg); }

.tabs {
  display: flex;
  background: var(--color-card);
  padding: 8rpx 16rpx;
  gap: 8rpx;
  border-bottom: 1rpx solid var(--color-border-light);
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 26rpx;
  color: var(--color-text-secondary);
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  &.active {
    background: var(--color-primary);
    text { color: #fff; }
  }
}

.orders { padding: 24rpx; }
.order-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: var(--shadow-sm);
}
.oc-hd {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
}
.oc-no { font-size: 22rpx; color: var(--color-text-muted); }
.oc-status { font-size: 22rpx; color: var(--color-primary); font-weight: 500; }
.oc-summary { font-size: 28rpx; color: var(--color-text); font-weight: 500; display: block; }
.oc-date { font-size: 22rpx; color: var(--color-text-muted); margin-top: 8rpx; display: block; }

.empty { text-align: center; padding: 200rpx 0; }
.empty-icon { font-size: 64rpx; color: var(--color-text-muted); opacity: 0.4; }
.empty-text { display: block; margin-top: 24rpx; font-size: 28rpx; color: var(--color-text-secondary); }
</style>
