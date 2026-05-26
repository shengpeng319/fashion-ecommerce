<template>
  <view class="order-detail-page">
    <!-- Status Header -->
    <view class="status-header" :class="order.status">
      <text class="sh-status">{{ statusMap[order.status] }}</text>
      <text class="sh-desc">{{ statusDescMap[order.status] }}</text>
    </view>

    <!-- Address -->
    <view class="address-card" v-if="order.address">
      <view class="ac-header">
        <text class="ac-label">收货地址</text>
      </view>
      <text class="ac-name">{{ order.address.name }}</text>
      <text class="ac-phone">{{ order.address.phone }}</text>
      <text class="ac-detail">{{ order.address.province }}{{ order.address.city }}{{ order.address.district }}{{ order.address.detail }}</text>
    </view>

    <!-- Items -->
    <view class="items-card">
      <view class="ic-header">
        <text class="ic-label">订单商品</text>
      </view>
      <view v-for="item in order.items" :key="item.id" class="ic-item">
        <image :src="getImg(item)" mode="aspectFill" class="ic-img" />
        <view class="ic-info">
          <text class="ic-name">{{ item.productName }}</text>
          <text class="ic-sku" v-if="item.skuName">{{ item.skuName }}</text>
          <view class="ic-bottom">
            <text class="ic-price">¥{{ item.price }}</text>
            <text class="ic-qty">× {{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Order Info -->
    <view class="info-card">
      <view class="if-row">
        <text class="if-label">订单编号</text>
        <text class="if-value">{{ order.orderNo }}</text>
      </view>
      <view class="if-row">
        <text class="if-label">下单时间</text>
        <text class="if-value">{{ formatTime(order.createdAt) }}</text>
      </view>
      <view class="if-row" v-if="order.payTime">
        <text class="if-label">支付时间</text>
        <text class="if-value">{{ formatTime(order.payTime) }}</text>
      </view>
      <view class="if-row if-total">
        <text class="if-label">实付金额</text>
        <text class="if-price">¥{{ order.payAmount }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

const order = ref<any>({})

const statusMap: Record<string, string> = {
  pending: '待付款',
  paid: '备货中',
  shipped: '运输中',
  completed: '已送达',
  cancelled: '已取消'
}

const statusDescMap: Record<string, string> = {
  pending: '请尽快完成付款',
  paid: '您的订单正在备货中',
  shipped: '您的包裹正在路上',
  completed: '感谢您的购买',
  cancelled: '该订单已取消'
}

const getImg = (item: any) => {
  try { return JSON.parse(item.image || '[]')[0] } catch { return '' }
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onLoad(async (opt: any) => {
  if (opt.id) {
    try { order.value = await request(`/orders/${opt.id}`, 'GET') } catch (e) {}
  }
})
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background: var(--color-bg);
}

// Status Header
.status-header {
  padding: 56rpx 32rpx 40rpx;
  text-align: center;
  background: var(--color-dark);
  &.pending { background: var(--color-dark); }
  &.paid { background: var(--color-primary); }
  &.shipped { background: #3A5A7C; }
  &.completed { background: var(--color-accent); }
  &.cancelled { background: var(--color-dark-surface); }
}
.sh-status {
  font-family: var(--font-display);
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 4rpx;
}
.sh-desc {
  display: block;
  font-size: 24rpx;
  color: rgba(255,255,255,0.7);
  margin-top: 12rpx;
  font-weight: 300;
}

// Address
.address-card {
  background: var(--color-card);
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
}
.ac-header {
  margin-bottom: 16rpx;
}
.ac-label {
  font-size: 20rpx;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 3rpx;
}
.ac-name {
  font-family: var(--font-display);
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-text);
  margin-right: 16rpx;
}
.ac-phone {
  font-size: 28rpx;
  color: var(--color-text-secondary);
}
.ac-detail {
  display: block;
  font-size: 26rpx;
  color: var(--color-text-muted);
  margin-top: 12rpx;
  line-height: 1.5;
}

// Items
.items-card {
  background: var(--color-card);
  margin-bottom: 20rpx;
}
.ic-header {
  padding: 24rpx 32rpx 0;
}
.ic-label {
  font-size: 20rpx;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 3rpx;
}
.ic-item {
  display: flex;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid var(--color-divider);
  &:last-child { border-bottom: none; }
}
.ic-img {
  width: 140rpx;
  height: 170rpx;
  border-radius: var(--radius-sm);
  margin-right: 20rpx;
}
.ic-info { flex: 1; min-width: 0; }
.ic-name {
  display: block;
  font-size: 28rpx;
  color: var(--color-text);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ic-sku {
  display: block;
  font-size: 22rpx;
  color: var(--color-text-muted);
  margin-top: 4rpx;
}
.ic-bottom {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
}
.ic-price {
  font-family: var(--font-display);
  font-size: 30rpx;
  font-weight: 700;
  color: var(--color-primary);
}
.ic-qty {
  font-size: 26rpx;
  color: var(--color-text-muted);
}

// Order Info
.info-card {
  background: var(--color-card);
  padding: 8rpx 32rpx 24rpx;
}
.if-row {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid var(--color-divider);
  &:last-child { border-bottom: none; }
}
.if-label {
  font-size: 26rpx;
  color: var(--color-text-muted);
}
.if-value {
  font-size: 26rpx;
  color: var(--color-text);
  font-weight: 400;
}
.if-total {
  padding-top: 24rpx;
  border-bottom: none;
  .if-label { font-weight: 600; color: var(--color-text); }
}
.if-price {
  font-family: var(--font-display);
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-primary);
}
</style>
