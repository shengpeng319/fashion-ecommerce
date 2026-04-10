<template>
  <view class="order-detail">
    <view class="status-section">
      <text class="status-text">{{ order.statusText }}</text>
      <text class="status-desc">{{ order.statusDesc }}</text>
    </view>
    <view class="address-section">
      <text class="name">{{ order.address?.name }} {{ order.address?.phone }}</text>
      <text class="detail">{{ order.address?.province }}{{ order.address?.city }}{{ order.address?.district }}{{ order.address?.detail }}</text>
    </view>
    <view class="goods-list">
      <view v-for="item in order.items" :key="item.id" class="goods-item">
        <image :src="item.image" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ item.name }}</text>
          <text class="sku">{{ item.sku || '默认规格' }}</text>
          <view class="bottom"><text class="price">¥{{ item.price }}</text><text class="qty">x{{ item.quantity }}</text></view>
        </view>
      </view>
    </view>
    <view class="order-info">
      <view>订单号: {{ order.orderNo }}</view>
      <view>下单时间: {{ order.createdAt }}</view>
      <view>支付方式: {{ order.payType || '未支付' }}</view>
      <view class="amount">实付款: ¥{{ order.payAmount }}</view>
    </view>
  </view>
</template>
<script setup lang="ts">
const order = ref<any>({})
onLoad((opt: any) => { /* TODO: fetch order detail */ })
</script>
<style lang="scss" scoped>
.order-detail { min-height: 100vh; padding-bottom: 24rpx; }
.status-section { background: linear-gradient(to bottom, #ff5777, #ff8a9a); color: #fff; padding: 48rpx 24rpx; .status-text { font-size: 36rpx; font-weight: bold; } .status-desc { font-size: 28rpx; display: block; margin-top: 8rpx; } }
.address-section { background: #fff; padding: 24rpx; margin-bottom: 16rpx; .name { font-size: 32rpx; font-weight: bold; } .detail { font-size: 28rpx; color: #666; display: block; margin-top: 8rpx; } }
.goods-list { background: #fff; .goods-item { display: flex; padding: 24rpx; border-bottom: 1rpx solid #f5f5f5; image { width: 160rpx; height: 160rpx; border-radius: 8rpx; margin-right: 16rpx; } .info { flex: 1; } .name { font-size: 28rpx; display: block; } .sku { font-size: 24rpx; color: #999; } .bottom { display: flex; justify-content: space-between; margin-top: 16rpx; } .price { color: #ff5777; font-weight: bold; } } }
.order-info { background: #fff; padding: 24rpx; margin-top: 16rpx; font-size: 28rpx; view { margin-bottom: 16rpx; } .amount { color: #ff5777; font-weight: bold; font-size: 32rpx; } }
</style>
