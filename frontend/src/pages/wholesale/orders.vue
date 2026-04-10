<template>
  <view class="wholesale-orders">
    <view class="tabs">
      <view v-for="tab in tabs" :key="tab.key" :class="{ active: currentTab === tab.key }" @tap="currentTab = tab.key">{{ tab.name }}</view>
    </view>
    <view class="order-list">
      <view v-for="order in orders" :key="order.id" class="order-item">
        <view class="header"><text class="order-no">{{ order.orderNo }}</text><text class="status">{{ order.statusText }}</text></view>
        <view class="goods">{{ order.totalQty }}件商品 合计: ¥{{ order.totalAmount }}</view>
        <view class="time">{{ order.createdAt }}</view>
      </view>
      <view v-if="orders.length === 0" class="empty">暂无订单</view>
    </view>
  </view>
</template>
<script setup lang="ts">
const tabs = [{ key: 'pending', name: '待审核' }, { key: 'approved', name: '已通过' }, { key: 'rejected', name: '已拒绝' }]
const currentTab = ref('pending')
const orders = ref<any[]>([])
</script>
<style lang="scss" scoped>
.wholesale-orders { min-height: 100vh; }
.tabs { display: flex; background: #fff; padding: 24rpx 0; view { flex: 1; text-align: center; &.active { color: #ff5777; font-weight: bold; border-bottom: 4rpx solid #ff5777; } } }
.order-list { padding: 16rpx; }
.order-item { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; .header { display: flex; justify-content: space-between; margin-bottom: 16rpx; .order-no { color: #999; font-size: 24rpx; } .status { color: #ff5777; } } .goods { font-size: 28rpx; } .time { font-size: 24rpx; color: #999; margin-top: 8rpx; } }
.empty { text-align: center; padding: 100rpx 0; color: #999; }
</style>
