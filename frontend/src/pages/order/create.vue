<template>
  <view class="order-create">
    <!-- Address Section -->
    <view class="address-section" @tap="goSelectAddress">
      <view v-if="address" class="address-info">
        <view class="name-row">
          <text class="name">{{ address.name }}</text>
          <text class="phone">{{ address.phone }}</text>
        </view>
        <text class="detail">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}</text>
      </view>
      <view v-else class="add-address">+ 添加收货地址</view>
      <text class="arrow">›</text>
    </view>
    
    <!-- Goods List -->
    <view class="goods-list" v-if="orderItems.length">
      <view v-for="item in orderItems" :key="item.id || item.productId" class="goods-item">
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
    
    <!-- Footer -->
    <view class="footer">
      <view class="total-wrap">
        <text class="total-label">合计：</text>
        <text class="total-price">¥{{ total }}</text>
      </view>
      <button type="primary" class="pay-btn" @tap="submitOrder">提交订单</button>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request, getToken } from '@/utils/request'

const address = ref<any>(null)
const orderItems = ref<any[]>([])
const total = computed(() => 
  orderItems.value.reduce((sum: number, i: any) => 
    sum + Number(i.product?.price || 0) * i.quantity, 0
  ).toFixed(2)
)

onShow(() => {
  if (!getToken()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/user/login' }), 1000)
    return
  }
  
  // Get selected address
  const savedAddress = uni.getStorageSync('selectedAddress')
  if (savedAddress) {
    address.value = savedAddress
    uni.removeStorageSync('selectedAddress')
  }
  
  // Check if coming from cart (with selected items)
  const cartSelected = uni.getStorageSync('cartSelectedItems')
  if (cartSelected) {
    orderItems.value = cartSelected
    uni.removeStorageSync('cartSelectedItems')
  }
  
  // Check if direct buy
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  if (currentPage.options?.productId) {
    loadProduct(currentPage.options.productId)
  }
})

const loadProduct = async (productId: string) => {
  try {
    const product: any = await request(`/products/${productId}`, 'GET')
    orderItems.value = [{ id: 'direct', product, quantity: 1 }]
  } catch (e) {
    uni.showToast({ title: '加载商品失败', icon: 'none' })
  }
}

const goSelectAddress = () => {
  uni.navigateTo({ url: '/pages/address/list?mode=select' })
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
    
    const res: any = await request('/orders', 'POST', { 
      addressId: address.value.id, 
      items 
    })
    
    // Simulate payment
    uni.showLoading({ title: '支付中...' })
    setTimeout(async () => {
      try {
        await request(`/orders/${res.id}/pay`, 'POST')
        uni.hideLoading()
        uni.showToast({ title: '支付成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/order/list' })
        }, 1500)
      } catch (e) {
        uni.hideLoading()
        // Even if pay fails, show order created
        uni.showToast({ title: '订单已创建', icon: 'success' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/order/list' })
        }, 1500)
      }
    }, 1000)
  } catch (e: any) {
    uni.showToast({ title: e.error || '提交失败', icon: 'none' })
  }
}
</script>
<style lang="scss" scoped>
.order-create { min-height: 100vh; padding-bottom: 120rpx; background: #f8f8f8; }
.address-section { 
  display: flex; 
  align-items: center; 
  padding: 32rpx 24rpx; 
  background: #fff; 
  margin-bottom: 16rpx;
}
.address-info { flex: 1; }
.name-row { display: flex; gap: 16rpx; align-items: center; }
.name { font-size: 32rpx; font-weight: bold; }
.phone { font-size: 28rpx; color: #666; }
.detail { font-size: 26rpx; color: #999; display: block; margin-top: 8rpx; }
.add-address { flex: 1; color: #ff5777; font-size: 28rpx; }
.arrow { color: #999; font-size: 32rpx; }

.goods-list { background: #fff; }
.goods-item { display: flex; padding: 24rpx; border-bottom: 1rpx solid #f5f5f5; }
.goods-item image { width: 160rpx; height: 160rpx; border-radius: 8rpx; margin-right: 16rpx; }
.info { flex: 1; }
.name { font-size: 28rpx; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 400rpx; }
.sku { font-size: 24rpx; color: #999; display: block; margin-top: 8rpx; }
.bottom { display: flex; justify-content: space-between; margin-top: 16rpx; }
.price { color: #ff5777; font-weight: bold; font-size: 30rpx; }
.qty { color: #999; font-size: 28rpx; }

.footer { 
  position: fixed; 
  bottom: 0; 
  left: 0; 
  right: 0; 
  height: 100rpx; 
  background: #fff; 
  border-top: 1rpx solid #e5e5e5; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0 24rpx;
}
.total-wrap { display: flex; align-items: baseline; gap: 8rpx; }
.total-label { font-size: 28rpx; color: #666; }
.total-price { color: #ff5777; font-weight: bold; font-size: 40rpx; }
.pay-btn {
  height: 72rpx;
  line-height: 72rpx;
  background: linear-gradient(135deg, #ff5777, #ff8a9a);
  border-radius: 36rpx;
  color: #fff;
  font-size: 30rpx;
  padding: 0 48rpx;
  border: none;
}
</style>
