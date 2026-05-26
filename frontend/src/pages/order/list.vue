<template>
  <view class="order-list-page">
    <scroll-view scroll-x class="tabs-wrap" :show-scrollbar="false">
      <view class="tabs">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: currentTab === tab.key }"
          @tap="currentTab = tab.key"
        >
          <text class="tab-text" :class="{ active: currentTab === tab.key }">{{ tab.label }}</text>
        </view>
      </view>
    </scroll-view>

    <scroll-view scroll-y class="orders-scroll">
      <view
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card"
        @tap="goDetail(order.id)"
      >
        <view class="oc-header">
          <text class="oc-no">{{ order.orderNo }}</text>
          <text class="oc-status" :class="order.status">{{ statusMap[order.status] }}</text>
        </view>
        <view class="oc-items">
          <image
            v-for="(item, i) in order.items.slice(0, 3)"
            :key="i"
            :src="getImg(item)"
            mode="aspectFill"
            class="oc-img"
          />
          <view class="oc-more" v-if="order.items.length > 3">
            <text class="oc-more-text">+{{ order.items.length - 3 }}</text>
          </view>
        </view>
        <view class="oc-footer">
          <text class="oc-count">{{ order.items.length }}件商品</text>
          <text class="oc-total">合计 <text class="oc-total-price">¥{{ order.payAmount }}</text></text>
        </view>
      </view>

      <EmptyState
        v-if="filteredOrders.length === 0"
        icon="📦"
        title="暂无订单"
        description="快去挑选心仪的商品吧"
      />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request } from '@/utils/request'
import EmptyState from '@/components/EmptyState.vue'

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
  background: var(--bg-secondary, #F5F5F5);
  display: flex;
  flex-direction: column;
}

.tabs-wrap {
  background: #FFFFFF;
  border-bottom: 1rpx solid var(--border, #EEEEEE);
}

.tabs {
  display: flex;
  padding: 16rpx 24rpx;
  gap: 16rpx;
}

.tab-item {
  flex-shrink: 0;
  padding: 14rpx 32rpx;
  background: var(--bg-secondary, #F5F5F5);
  border-radius: var(--radius-full, 9999rpx);

  &.active {
    background: var(--accent, #C8102E);
  }
}

.tab-text {
  font-size: 26rpx;
  color: var(--text-secondary, #333333);
  font-weight: 500;

  &.active {
    color: #FFFFFF;
  }
}

.orders-scroll {
  flex: 1;
  padding: 24rpx;
}

.order-card {
  background: #FFFFFF;
  border-radius: var(--radius-sm, 8rpx);
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.oc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.oc-no {
  font-size: 22rpx;
  color: var(--text-quaternary, #999999);
}

.oc-status {
  font-size: 22rpx;
  font-weight: 500;

  &.pending { color: #B8860B; }
  &.paid { color: #C8102E; }
  &.shipped { color: #1565C0; }
  &.completed { color: #2E7D32; }
  &.cancelled { color: #999999; }
}

.oc-items {
  display: flex;
  gap: 12rpx;
}

.oc-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: var(--radius-sm, 8rpx);
}

.oc-more {
  width: 120rpx;
  height: 120rpx;
  background: var(--bg-secondary, #F5F5F5);
  border-radius: var(--radius-sm, 8rpx);
  display: flex;
  align-items: center;
  justify-content: center;
}

.oc-more-text {
  font-size: 24rpx;
  color: var(--text-quaternary, #999999);
}

.oc-footer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid var(--divider, #F0F0F0);
}

.oc-count {
  font-size: 24rpx;
  color: var(--text-quaternary, #999999);
}

.oc-total {
  font-size: 24rpx;
  color: var(--text-tertiary, #666666);
}

.oc-total-price {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--accent, #C8102E);
}
</style>
