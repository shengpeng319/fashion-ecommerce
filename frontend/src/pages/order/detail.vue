<template>
  <view class="order-detail">
    <view class="status-section" :class="order.status">
      <text class="status-text">{{ getStatusText(order.status) }}</text>
      <text class="status-desc">{{ getStatusDesc(order.status) }}</text>
    </view>
    <view class="address-section" v-if="order.address">
      <view class="address-row">
        <text class="icon">📍</text>
        <view class="address-info">
          <text class="name">{{ order.address.name }} {{ order.address.phone }}</text>
          <text class="detail">{{ order.address.province }}{{ order.address.city }}{{ order.address.district }}{{ order.address.detail }}</text>
        </view>
      </view>
    </view>
    <view class="goods-list">
      <view v-for="item in order.items" :key="item.id" class="goods-item">
        <image :src="JSON.parse(item.image || '[]')[0] || '/static/images/default.png'" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ item.productName }}</text>
          <text class="sku">{{ item.skuName || '默认规格' }}</text>
          <view class="bottom">
            <text class="price">¥{{ item.price }}</text>
            <text class="qty">x{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="order-info">
      <view class="info-row"><text class="label">订单号</text><text class="value">{{ order.orderNo }}</text></view>
      <view class="info-row"><text class="label">下单时间</text><text class="value">{{ formatTime(order.createdAt) }}</text></view>
      <view class="info-row" v-if="order.payTime"><text class="label">支付时间</text><text class="value">{{ formatTime(order.payTime) }}</text></view>
      <view class="info-row"><text class="label">支付方式</text><text class="value">{{ order.payType || '模拟支付' }}</text></view>
      <view class="info-row amount"><text class="label">实付款</text><text class="value">¥{{ order.payAmount }}</text></view>
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
  paid: '待发货',
  shipped: '待收货',
  completed: '已完成',
  cancelled: '已取消'
}

const statusDescMap: Record<string, string> = {
  pending: '请尽快完成支付',
  paid: '商家正在准备发货',
  shipped: '商品运输中，请注意查收',
  completed: '交易已完成，感谢购买',
  cancelled: '订单已取消'
}

const getStatusText = (status: string) => statusMap[status] || status
const getStatusDesc = (status: string) => statusDescMap[status] || ''

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

onLoad(async (opt: any) => {
  if (opt.id) {
    try {
      const res: any = await request(`/orders/${opt.id}`, 'GET')
      order.value = res
    } catch (e) {
      console.error('load order error', e)
    }
  }
})
</script>
<style lang="scss" scoped>
.order-detail { min-height: 100vh; padding-bottom: 24rpx; background: #f5f5f5; }
.status-section { padding: 48rpx 24rpx; color: #fff; }
.status-section.pending { background: linear-gradient(135deg, #ff9500, #ffad00); }
.status-section.paid { background: linear-gradient(135deg, #ff5777, #ff8a9a); }
.status-section.shipped { background: linear-gradient(135deg, #007aff, #5ac8fa); }
.status-section.completed { background: linear-gradient(135deg, #34c759, #30d158); }
.status-section.cancelled { background: linear-gradient(135deg, #8e8e93, #aeaeb2); }
.status-text { font-size: 36rpx; font-weight: bold; }
.status-desc { font-size: 28rpx; display: block; margin-top: 8rpx; opacity: 0.9; }

.address-section { background: #fff; padding: 24rpx; margin-bottom: 16rpx; }
.address-row { display: flex; align-items: center; gap: 16rpx; }
.icon { font-size: 40rpx; }
.address-info { flex: 1; }
.name { font-size: 32rpx; font-weight: bold; display: block; }
.detail { font-size: 28rpx; color: #666; display: block; margin-top: 8rpx; }

.goods-list { background: #fff; margin-bottom: 16rpx; }
.goods-item { display: flex; padding: 24rpx; border-bottom: 1rpx solid #f5f5f5; }
.goods-item:last-child { border-bottom: none; }
.goods-item image { width: 160rpx; height: 160rpx; border-radius: 8rpx; margin-right: 16rpx; }
.info { flex: 1; }
.name { font-size: 28rpx; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sku { font-size: 24rpx; color: #999; display: block; margin-top: 8rpx; }
.bottom { display: flex; justify-content: space-between; margin-top: 16rpx; }
.price { color: #ff5777; font-weight: bold; font-size: 30rpx; }
.qty { color: #999; font-size: 28rpx; }

.order-info { background: #fff; padding: 24rpx; }
.info-row { display: flex; justify-content: space-between; margin-bottom: 20rpx; }
.label { font-size: 28rpx; color: #999; }
.value { font-size: 28rpx; color: #333; }
.amount .value { color: #ff5777; font-weight: bold; font-size: 32rpx; }
</style>
