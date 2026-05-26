<template>
  <view class="order-list-page">
    <!-- Tabs -->
    <scroll-view scroll-x class="tabs-wrap" :show-scrollbar="false">
      <view class="tabs">
        <view v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: currentTab === tab.key }" @tap="currentTab = tab.key">
          <text>{{ tab.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Orders -->
    <scroll-view scroll-y class="orders-scroll">
      <view class="order-card" v-for="order in filteredOrders" :key="order.id" @tap="goDetail(order.id)">
        <view class="oc-header">
          <text class="oc-no">{{ order.orderNo }}</text>
          <text class="oc-status" :class="order.status">{{ statusMap[order.status] }}</text>
        </view>
        <view class="oc-items">
          <image v-for="(item, i) in order.items.slice(0, 3)" :key="i"
            :src="getImg(item)" mode="aspectFill" class="oc-img" />
          <view class="oc-more" v-if="order.items.length > 3">
            <text>+{{ order.items.length - 3 }}</text>
          </view>
        </view>
        <view class="oc-footer">
          <text class="oc-count">{{ order.items.length }} 件商品</text>
          <text class="oc-total">合计 ¥{{ order.payAmount }}</text>
        </view>
      </view>

      <view v-if="filteredOrders.length === 0" class="empty">
        <text class="empty-icon">◇</text>
        <text class="empty-text">暂无订单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'paid', label: '待发货' },
  { key: 'shipped', label: '运输中' },
  { key: 'completed', label: '已完成' }
]
const currentTab = ref('all')
const orders = ref<any[]>([])

const statusMap: Record<string, string> = {
  pending: '待付款',
  paid: '待发货',
  shipped: '运输中',
  completed: '已完成',
  cancelled: '已取消'
}

const getImg = (item: any) => {
  try { return JSON.parse(item.image || '[]')[0] } catch { return '' }
}

const filteredOrders = computed(() => {
  if (currentTab.value === 'all') return orders.value
  return orders.value.filter(o => o.status === currentTab.value)
})

onShow(() => { loadOrders() })

const loadOrders = async () => {
  try {
    const res: any = await request('/orders', 'GET')
    orders.value = Array.isArray(res) ? res : []
  } catch (e) { console.error(e) }
}

const goDetail = (id: string) => {
  uni.navigateTo({ url: `/pages/order/detail?id=${id}` })
}
</script>

<style lang="scss" scoped>
.order-list-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}
.tabs-wrap {
  background: var(--color-card);
  border-bottom: 1rpx solid var(--color-border-light);
}
.tabs {
  display: flex;
  padding: 8rpx 16rpx;
  gap: 8rpx;
}
.tab-item {
  flex-shrink: 0;
  padding: 16rpx 28rpx;
  font-size: 26rpx;
  color: var(--color-text-secondary);
  font-weight: 500;
  border-radius: 24rpx;
  transition: all var(--transition-base);
  &.active {
    background: var(--color-primary);
    text { color: #fff; }
  }
}
.orders-scroll {
  flex: 1;
  padding: 24rpx;
}
.order-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: var(--shadow-sm);
}
.oc-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.oc-no {
  font-size: 22rpx;
  color: var(--color-text-muted);
  font-weight: 400;
}
.oc-status {
  font-size: 22rpx;
  font-weight: 500;
  letter-spacing: 1rpx;
  &.pending { color: var(--color-warning); }
  &.paid { color: var(--color-primary); }
  &.shipped { color: #3A5A7C; }
  &.completed { color: var(--color-accent); }
  &.cancelled { color: var(--color-text-muted); }
}
.oc-items {
  display: flex;
  gap: 8rpx;
}
.oc-img {
  width: 120rpx;
  height: 150rpx;
  border-radius: var(--radius-sm);
}
.oc-more {
  width: 120rpx;
  height: 150rpx;
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  text { font-size: 24rpx; color: var(--color-text-muted); }
}
.oc-footer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid var(--color-divider);
}
.oc-count { font-size: 24rpx; color: var(--color-text-muted); }
.oc-total {
  font-family: var(--font-display);
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text);
}
.empty {
  text-align: center;
  padding: 200rpx 0;
}
.empty-icon { font-size: 64rpx; color: var(--color-text-muted); opacity: 0.4; }
.empty-text { display: block; margin-top: 24rpx; font-size: 28rpx; color: var(--color-text-secondary); }
</style>
