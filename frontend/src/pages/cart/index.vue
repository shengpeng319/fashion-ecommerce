<template>
  <view class="cart-page">
    <!-- Login Tip -->
    <view class="login-tip" v-if="!isLoggedIn">
      <text>登录后可查看购物车</text>
      <button class="login-btn" @tap="goLogin">登录</button>
    </view>

    <!-- Empty State -->
    <view class="empty-state" v-else-if="cartItems.length === 0">
      <text class="empty-icon">🛒</text>
      <text class="empty-title">购物车是空的</text>
      <text class="empty-sub">快去挑选心仪的商品吧</text>
      <button class="go-btn" @tap="goShopping">去逛逛</button>
    </view>

    <!-- Cart Items -->
    <view class="cart-content" v-else>
      <view class="cart-header">
        <text class="header-title">购物车</text>
        <text class="item-count">共{{ cartItems.length }}件商品</text>
      </view>

      <view v-for="item in cartItems" :key="item.id" class="cart-item">
        <view class="item-selector" @tap="toggleItem(item.id)">
          <view class="checkbox" :class="{ checked: selectedIds.includes(item.id) }">
            <text v-if="selectedIds.includes(item.id)">✓</text>
          </view>
        </view>
        <view class="item-img">
          <image :src="JSON.parse(item.product?.images || '[]')[0]" mode="aspectFill" />
        </view>
        <view class="item-info">
          <text class="item-name">{{ item.product?.name }}</text>
          <text class="item-sku">{{ item.sku?.name || '默认规格' }}</text>
          <view class="item-bottom">
            <text class="item-price">¥{{ item.product?.price }}</text>
            <view class="stepper">
              <view class="stepper-btn" @tap.stop="changeQty(item, -1)">−</view>
              <text class="stepper-num">{{ item.quantity }}</text>
              <view class="stepper-btn" @tap.stop="changeQty(item, 1)">+</view>
            </view>
          </view>
        </view>
        <view class="item-delete" @tap.stop="deleteItem(item.id)">
          <text>删除</text>
        </view>
      </view>
    </view>

    <!-- Bottom Bar -->
    <view class="bottom-bar" v-if="isLoggedIn && cartItems.length > 0">
      <view class="select-all" @tap="toggleSelectAll">
        <view class="checkbox" :class="{ checked: selectedIds.length === cartItems.length && cartItems.length > 0 }">
          <text v-if="selectedIds.length === cartItems.length && cartItems.length > 0">✓</text>
        </view>
        <text class="select-text">全选</text>
      </view>
      <view class="total-wrap">
        <view class="total-row">
          <text class="total-label">合计</text>
          <text class="total-price">¥{{ total }}</text>
        </view>
        <text class="total-tip">不含运费</text>
      </view>
      <view class="checkout-btn" :class="{ disabled: selectedIds.length === 0 }" @tap="checkout">
        <text>结算({{ selectedIds.length }})</text>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

const isLoggedIn = ref(false)
const cartItems = ref<any[]>([])
const selectedIds = ref<string[]>([])

const checkLogin = () => {
  isLoggedIn.value = !!uni.getStorageSync('token')
}

const loadCart = async () => {
  if (!isLoggedIn.value) return
  try {
    const res: any = await request('/cart', 'GET')
    cartItems.value = Array.isArray(res) ? res : (res.data || [])
    selectedIds.value = []
  } catch (e) {
    console.error('load cart error', e)
  }
}

onShow(() => {
  checkLogin()
  if (isLoggedIn.value) loadCart()
})

const toggleItem = (id: string) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) {
    selectedIds.value = selectedIds.value.filter((i: string) => i !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

const toggleSelectAll = () => {
  if (selectedIds.value.length === cartItems.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = cartItems.value.map((i: any) => i.id)
  }
}

const total = computed(() => 
  cartItems.value
    .filter((i: any) => selectedIds.value.includes(i.id))
    .reduce((sum: number, i: any) => sum + Number(i.product?.price || 0) * i.quantity, 0)
    .toFixed(2)
)

const changeQty = async (item: any, delta: number) => {
  const newQty = item.quantity + delta
  if (newQty < 1) return
  try {
    await request(`/cart/${item.id}`, 'PUT', { quantity: newQty })
    item.quantity = newQty
  } catch (e) {
    uni.showToast({ title: '更新失败', icon: 'none' })
  }
}

const deleteItem = async (id: string) => {
  try {
    await request(`/cart/${id}`, 'DELETE')
    cartItems.value = cartItems.value.filter((i: any) => i.id !== id)
    selectedIds.value = selectedIds.value.filter((sid: string) => sid !== id)
    uni.showToast({ title: '已删除', icon: 'none' })
  } catch (e) {
    uni.showToast({ title: '删除失败', icon: 'none' })
  }
}

const goLogin = () => uni.navigateTo({ url: '/pages/user/login' })
const goShopping = () => uni.switchTab({ url: '/pages/index/index' })
const checkout = () => {
  if (selectedIds.value.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  uni.setStorageSync('cartSelectedItems', cartItems.value.filter((i: any) => selectedIds.value.includes(i.id)))
  uni.navigateTo({ url: '/pages/order/create' })
}
</script>
<style lang="scss" scoped>
.cart-page { 
  min-height: 100vh; 
  background: #f5f5f5; 
  padding-bottom: 140rpx;
}

.login-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24rpx;
  padding: 60rpx 0;
  text { font-size: 28rpx; color: #666; }
  .login-btn {
    background: linear-gradient(135deg, #ff5777, #ff8a9a);
    color: #fff;
    font-size: 26rpx;
    padding: 16rpx 32rpx;
    border-radius: 32rpx;
    border: none;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0 60rpx;
  .empty-icon { font-size: 120rpx; }
  .empty-title { font-size: 32rpx; color: #333; font-weight: 600; margin-top: 24rpx; }
  .empty-sub { font-size: 26rpx; color: #999; margin-top: 12rpx; }
  .go-btn {
    margin-top: 40rpx;
    background: linear-gradient(135deg, #ff5777, #ff8a9a);
    color: #fff;
    font-size: 28rpx;
    padding: 20rpx 60rpx;
    border-radius: 40rpx;
    border: none;
  }
}

.cart-content { }
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  .header-title { font-size: 32rpx; font-weight: 600; color: #333; }
  .item-count { font-size: 24rpx; color: #999; }
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  margin: 16rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.item-selector {
  padding: 8rpx;
  .checkbox {
    width: 40rpx;
    height: 40rpx;
    border: 2rpx solid #ccc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    &.checked {
      background: #ff5777;
      border-color: #ff5777;
      text { color: #fff; font-size: 24rpx; }
    }
  }
}
.item-img {
  width: 180rpx;
  height: 180rpx;
  margin: 0 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
  image { width: 100%; height: 100%; }
}
.item-info { flex: 1; }
.item-name { 
  display: block; 
  font-size: 28rpx; 
  color: #333; 
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 320rpx;
}
.item-sku { 
  display: block; 
  font-size: 22rpx; 
  color: #999; 
  margin-top: 8rpx;
}
.item-bottom { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-top: 16rpx;
}
.item-price { 
  color: #ff5777; 
  font-size: 30rpx; 
  font-weight: bold;
}
.stepper {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  overflow: hidden;
}
.stepper-btn {
  width: 48rpx;
  height: 48rpx;
  text-align: center;
  line-height: 48rpx;
  font-size: 32rpx;
  color: #666;
}
.stepper-num { 
  width: 56rpx; 
  text-align: center; 
  font-size: 28rpx;
}
.item-delete {
  padding: 8rpx 12rpx;
  text { font-size: 22rpx; color: #999; }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  z-index: 100;
}
.select-all {
  display: flex;
  align-items: center;
  gap: 8rpx;
  .checkbox {
    width: 40rpx;
    height: 40rpx;
    border: 2rpx solid #ccc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    &.checked {
      background: #ff5777;
      border-color: #ff5777;
      text { color: #fff; font-size: 24rpx; }
    }
  }
  .select-text { font-size: 26rpx; color: #666; }
}
.total-wrap {
  flex: 1;
  text-align: right;
  margin-right: 24rpx;
}
.total-row {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 8rpx;
}
.total-label { font-size: 24rpx; color: #666; }
.total-price { font-size: 36rpx; color: #ff5777; font-weight: bold; }
.total-tip { font-size: 20rpx; color: #bbb; }
.checkout-btn {
  background: linear-gradient(135deg, #ff5777, #ff8a9a);
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
  padding: 0 40rpx;
  height: 72rpx;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  &.disabled {
    background: #ccc;
    color: #fff;
  }
}
</style>
