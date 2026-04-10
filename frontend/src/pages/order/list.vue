<template>
  <view class="order-list">
    <view class="tabs">
      <view v-for="tab in tabs" :key="tab.key" :class="{ active: currentTab === tab.key }" @tap="currentTab = tab.key">{{ tab.name }}</view>
    </view>
    <view class="order-items">
      <view v-for="order in orders" :key="order.id" class="order-item" @tap="goDetail(order.id)">
        <view class="order-header">
          <text class="order-no">订单号: {{ order.orderNo }}</text>
          <text class="status">{{ order.statusText }}</text>
        </view>
        <view class="goods">
          <image v-for="(img, i) in order.items.slice(0, 3)" :key="i" :src="img" mode="aspectFill" />
          <text v-if="order.items.length > 3">+{{ order.items.length - 3 }}</text>
        </view>
        <view class="footer">
          <text class="total">共{{ order.totalQty }}件 合计: ¥{{ order.payAmount }}</text>
        </view>
      </view>
      <view v-if="orders.length === 0" class="empty">暂无订单</view>
    </view>
  </view>
</template>
<script setup lang="ts">
const tabs = [{ key: 'all', name: '全部' }, { key: 'pending', name: '待付款' }, { key: 'paid', name: '待发货' }, { key: 'shipped', name: '待收货' }]
const currentTab = ref('all')
const orders = ref<any[]>([])
const goDetail = (id: string) => { uni.navigateTo({ url: `/pages/order/detail?id=${id}` }) }
</script>
<style lang="scss" scoped>
.order-list { min-height: 100vh; }
.tabs { display: flex; background: #fff; padding: 24rpx 0; view { flex: 1; text-align: center; &.active { color: #ff5777; font-weight: bold; border-bottom: 4rpx solid #ff5777; } } }
.order-items { padding: 16rpx; }
.order-item { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; }
.order-header { display: flex; justify-content: space-between; margin-bottom: 16rpx; .order-no { font-size: 24rpx; color: #999; } .status { color: #ff5777; } }
.goods { display: flex; align-items: center; gap: 8rpx; image { width: 120rpx; height: 120rpx; border-radius: 8rpx; } }
.footer { display: flex; justify-content: flex-end; margin-top: 16rpx; .total { font-size: 28rpx; } }
.empty { text-align: center; padding: 100rpx 0; color: #999; }
</style>
