<template>
  <view class="order-list">
    <view class="tabs">
      <view v-for="tab in tabs" :key="tab.key" :class="{ active: currentTab === tab.key }" @tap="currentTab = tab.key">{{ tab.name }}</view>
    </view>
    <view class="order-items">
      <view v-for="order in filteredOrders" :key="order.id" class="order-item" @tap="goDetail(order.id)">
        <view class="order-header">
          <text class="order-no">订单号: {{ order.orderNo }}</text>
          <text class="status" :class="order.status">{{ getStatusText(order.status) }}</text>
        </view>
        <view class="goods">
          <image v-for="(item, i) in order.items.slice(0, 3)" :key="i" :src="JSON.parse(item.image || '[]')[0] || '/static/images/default.png'" mode="aspectFill" />
          <text v-if="order.items.length > 3">+{{ order.items.length - 3 }}</text>
        </view>
        <view class="footer">
          <text class="total">共{{ order.items.length }}件 合计: ¥{{ order.payAmount }}</text>
        </view>
      </view>
      <view v-if="filteredOrders.length === 0" class="empty">
        <text>暂无订单</text>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

const tabs = [
  { key: 'all', name: '全部' },
  { key: 'pending', name: '待付款' },
  { key: 'paid', name: '待发货' },
  { key: 'shipped', name: '待收货' },
  { key: 'completed', name: '已完成' }
]
const currentTab = ref('all')
const orders = ref<any[]>([])

const statusMap: Record<string, string> = {
  pending: '待付款',
  paid: '待发货',
  shipped: '待收货',
  completed: '已完成',
  cancelled: '已取消'
}

const getStatusText = (status: string) => statusMap[status] || status

const filteredOrders = computed(() => {
  if (currentTab.value === 'all') return orders.value
  return orders.value.filter(o => o.status === currentTab.value)
})

onShow(() => {
  loadOrders()
})

const loadOrders = async () => {
  try {
    const res: any = await request('/orders', 'GET')
    orders.value = Array.isArray(res) ? res : []
  } catch (e) {
    console.error('load orders error', e)
  }
}

const goDetail = (id: string) => {
  uni.navigateTo({ url: `/pages/order/detail?id=${id}` })
}
</script>
<style lang="scss" scoped>
.order-list { min-height: 100vh; background: #f5f5f5; }
.tabs { display: flex; background: #fff; padding: 24rpx 0; }
.tabs view { flex: 1; text-align: center; font-size: 28rpx; color: #666; }
.tabs view.active { color: #ff5777; font-weight: bold; border-bottom: 4rpx solid #ff5777; }
.order-items { padding: 16rpx; }
.order-item { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; }
.order-header { display: flex; justify-content: space-between; margin-bottom: 16rpx; }
.order-no { font-size: 24rpx; color: #999; }
.status { font-size: 26rpx; }
.status.pending { color: #ff9500; }
.status.paid { color: #ff5777; }
.status.shipped { color: #007aff; }
.status.completed { color: #34c759; }
.goods { display: flex; align-items: center; gap: 8rpx; flex-wrap: wrap; }
.goods image { width: 120rpx; height: 120rpx; border-radius: 8rpx; }
.goods text { font-size: 24rpx; color: #999; }
.footer { display: flex; justify-content: flex-end; margin-top: 16rpx; }
.total { font-size: 28rpx; color: #333; }
.empty { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
</style>
