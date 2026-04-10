<template>
  <view class="order-create">
    <view class="address-section" @tap="selectAddress">
      <view v-if="address" class="address-info">
        <text class="name">{{ address.name }} {{ address.phone }}</text>
        <text class="detail">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}</text>
      </view>
      <view v-else class="add-address">+ 添加收货地址</view>
      <text class="arrow">></text>
    </view>
    <view class="goods-list" v-if="orderItems.length">
      <view v-for="item in orderItems" :key="item.id" class="goods-item">
        <image :src="JSON.parse(item.product?.images || '[]')[0]" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ item.product?.name }}</text>
          <text class="sku">{{ item.sku?.name || '默认规格' }}</text>
          <view class="bottom">
            <text class="price">¥{{ item.product?.price }}</text>
            <text class="qty">x{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="footer">
      <view class="total">合计: <text class="price">¥{{ total }}</text></view>
      <button type="primary" @tap="submitOrder">提交订单</button>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request, getToken } from '@/utils/request'

const address = ref<any>(null)
const orderItems = ref<any[]>([])
const total = computed(() => orderItems.value.reduce((sum: number, i: any) => 
  sum + Number(i.product?.price || 0) * i.quantity, 0).toFixed(2))

onLoad(async (opt: any) => {
  if (!getToken()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/user/login' }), 1000)
    return
  }
  if (opt.productId) {
    // Direct buy - add single item
    try {
      const product: any = await request(`/products/${opt.productId}`, 'GET')
      orderItems.value = [{ id: 'direct', product, quantity: 1 }]
    } catch (e) {}
  }
})

const selectAddress = () => {
  uni.showToast({ title: '地址功能开发中', icon: 'none' })
}

const submitOrder = async () => {
  if (orderItems.value.length === 0) {
    uni.showToast({ title: '订单商品为空', icon: 'none' })
    return
  }
  if (!address.value) {
    uni.showToast({ title: '请添加收货地址', icon: 'none' })
    return
  }
  try {
    const items = orderItems.value.map((i: any) => ({
      productId: i.product.id,
      skuId: i.sku?.id || null,
      quantity: i.quantity
    }))
    const res: any = await request('/orders', 'POST', { addressId: address.value.id, items })
    if (res.id) {
      uni.showToast({ title: '订单提交成功' })
      setTimeout(() => uni.navigateTo({ url: '/pages/order/list' }), 1000)
    }
  } catch (e: any) {
    uni.showToast({ title: e.error || '提交失败', icon: 'none' })
  }
}
</script>
<style lang="scss" scoped>
.order-create { min-height: 100vh; padding-bottom: 120rpx; background: #f8f8f8; }
.address-section { display: flex; align-items: center; padding: 32rpx 24rpx; background: #fff; margin-bottom: 16rpx; }
.address-info { flex: 1; }
.name { font-size: 32rpx; font-weight: bold; }
.detail { font-size: 28rpx; color: #666; display: block; margin-top: 8rpx; }
.add-address { flex: 1; color: #ff5777; font-size: 28rpx; }
.arrow { color: #999; }
.goods-list { background: #fff; }
.goods-item { display: flex; padding: 24rpx; border-bottom: 1rpx solid #f5f5f5; }
.goods-item image { width: 160rpx; height: 160rpx; border-radius: 8rpx; margin-right: 16rpx; }
.info { flex: 1; }
.name { font-size: 28rpx; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sku { font-size: 24rpx; color: #999; }
.bottom { display: flex; justify-content: space-between; margin-top: 16rpx; }
.price { color: #ff5777; font-weight: bold; }
.qty { color: #999; font-size: 28rpx; }
.footer { position: fixed; bottom: 0; left: 0; right: 0; height: 100rpx; background: #fff; border-top: 1rpx solid #e5e5e5; display: flex; justify-content: space-between; align-items: center; padding: 0 24rpx; }
.total { font-size: 28rpx; }
.total .price { color: #ff5777; font-weight: bold; font-size: 36rpx; }
.footer button { margin: 0; }
</style>
