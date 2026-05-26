<template>
  <view class="order-detail-page">
    <view class="status-header" :class="order.status">
      <view class="sh-accent" :class="order.status"></view>
      <view class="sh-content">
        <text class="sh-status">{{ statusMap[order.status] }}</text>
        <text class="sh-desc">{{ statusDescMap[order.status] }}</text>
      </view>
    </view>

    <view class="address-card" v-if="order.address">
      <text class="section-label">收货地址</text>
      <view class="ac-info">
        <text class="ac-name">{{ order.address.name }}</text>
        <text class="ac-phone">{{ order.address.phone }}</text>
      </view>
      <text class="ac-detail">{{ order.address.province }}{{ order.address.city }}{{ order.address.district }}{{ order.address.detail }}</text>
    </view>

    <view class="items-card">
      <text class="section-label">订单商品</text>
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
  background: var(--bg-secondary, #F5F5F5);
}

.status-header {
  background: #FFFFFF;
  padding: 48rpx 32rpx;
  display: flex;
  align-items: stretch;
  margin-bottom: 16rpx;
}

.sh-accent {
  width: 8rpx;
  border-radius: 4rpx;
  margin-right: 24rpx;
  flex-shrink: 0;

  &.pending { background: #B8860B; }
  &.paid { background: #C8102E; }
  &.shipped { background: #1565C0; }
  &.completed { background: #2E7D32; }
  &.cancelled { background: #999999; }
}

.sh-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.sh-status {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--text-primary, #1A1A1A);
}

.sh-desc {
  font-size: 26rpx;
  color: var(--text-tertiary, #666666);
  margin-top: 8rpx;
}

.address-card {
  background: #FFFFFF;
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;
}

.section-label {
  display: block;
  font-size: 22rpx;
  font-weight: 600;
  color: var(--text-quaternary, #999999);
  letter-spacing: 2rpx;
  margin-bottom: 16rpx;
}

.ac-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.ac-name {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
}

.ac-phone {
  font-size: 28rpx;
  color: var(--text-secondary, #333333);
}

.ac-detail {
  display: block;
  font-size: 26rpx;
  color: var(--text-tertiary, #666666);
  line-height: 1.5;
}

.items-card {
  background: #FFFFFF;
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;
}

.ic-item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid var(--divider, #F0F0F0);

  &:last-child {
    border-bottom: none;
  }
}

.ic-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: var(--radius-sm, 8rpx);
  margin-right: 20rpx;
  flex-shrink: 0;
}

.ic-info {
  flex: 1;
  min-width: 0;
}

.ic-name {
  display: block;
  font-size: 28rpx;
  color: var(--text-primary, #1A1A1A);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ic-sku {
  display: block;
  font-size: 22rpx;
  color: var(--text-tertiary, #666666);
  margin-top: 4rpx;
}

.ic-bottom {
  display: flex;
  justify-content: space-between;
  margin-top: 12rpx;
}

.ic-price {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--accent, #C8102E);
}

.ic-qty {
  font-size: 26rpx;
  color: var(--text-quaternary, #999999);
}

.info-card {
  background: #FFFFFF;
  padding: 8rpx 32rpx 24rpx;
}

.if-row {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid var(--divider, #F0F0F0);

  &:last-child {
    border-bottom: none;
  }
}

.if-label {
  font-size: 26rpx;
  color: var(--text-tertiary, #666666);
}

.if-value {
  font-size: 26rpx;
  color: var(--text-primary, #1A1A1A);
}

.if-total {
  .if-label {
    font-weight: 600;
    color: var(--text-primary, #1A1A1A);
  }
}

.if-price {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--accent, #C8102E);
}
</style>
