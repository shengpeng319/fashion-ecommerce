<template>
  <view class="cart-page">
    <!-- Login Required -->
    <view class="auth-section" v-if="!isLoggedIn">
      <text class="auth-icon">◇</text>
      <text class="auth-title">请登录查看购物袋</text>
      <text class="auth-sub">您的精选好物在这里等您</text>
      <view class="auth-btn" @tap="goLogin">
        <text>登录</text>
      </view>
    </view>

    <!-- Empty State -->
    <view class="empty-state" v-else-if="cartItems.length === 0">
      <text class="empty-icon">◇</text>
      <text class="empty-title">购物袋是空的</text>
      <text class="empty-sub">探索我们的最新系列</text>
      <view class="empty-btn" @tap="goShopping">
        <text>去逛逛</text>
      </view>
    </view>

    <!-- Cart Items -->
    <view class="cart-content" v-else>
      <view class="cart-header">
        <text class="header-title">我的购物袋</text>
        <text class="header-count">{{ cartItems.length }} 件商品</text>
      </view>

      <view v-for="item in cartItems" :key="item.id" class="cart-item">
        <view class="item-check" @tap="toggleItem(item.id)">
          <view class="check-box" :class="{ checked: selectedIds.includes(item.id) }">
            <text v-if="selectedIds.includes(item.id)">✓</text>
          </view>
        </view>
        <view class="item-image">
          <image :src="getImage(item)" mode="aspectFill" />
        </view>
        <view class="item-details">
          <text class="item-name">{{ item.product?.name }}</text>
          <text class="item-variant" v-if="item.sku?.name">{{ item.sku.name }}</text>
          <view class="item-row">
            <text class="item-price">¥{{ item.product?.price }}</text>
            <view class="qty-stepper">
              <view class="qty-btn" @tap.stop="changeQty(item, -1)">−</view>
              <text class="qty-val">{{ item.quantity }}</text>
              <view class="qty-btn" @tap.stop="changeQty(item, 1)">+</view>
            </view>
          </view>
        </view>
        <view class="item-remove" @tap.stop="deleteItem(item.id)">
          <text>×</text>
        </view>
      </view>
    </view>

    <!-- Bottom Bar -->
    <view class="bottom-bar" v-if="isLoggedIn && cartItems.length > 0">
      <view class="select-all" @tap="toggleSelectAll">
        <view class="check-box" :class="{ checked: allSelected }">
          <text v-if="allSelected">✓</text>
        </view>
        <text class="select-label">全选</text>
      </view>
      <view class="total-area">
        <text class="total-price">¥{{ total }}</text>
        <text class="total-note">不含运费</text>
      </view>
      <view class="btn-checkout" :class="{ disabled: selectedIds.length === 0 }" @tap="checkout">
        <text>去结算 ({{ selectedIds.length }})</text>
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

const getImage = (item: any) => {
  try { return JSON.parse(item.product?.images || '[]')[0] } catch { return '' }
}

const allSelected = computed(() =>
  cartItems.value.length > 0 && selectedIds.value.length === cartItems.value.length
)

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
    selectedIds.value = selectedIds.value.filter(i => i !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = cartItems.value.map(i => i.id)
  }
}

const total = computed(() =>
  cartItems.value
    .filter(i => selectedIds.value.includes(i.id))
    .reduce((sum, i) => sum + Number(i.product?.price || 0) * i.quantity, 0)
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
    cartItems.value = cartItems.value.filter(i => i.id !== id)
    selectedIds.value = selectedIds.value.filter(sid => sid !== id)
    uni.showToast({ title: '已移除', icon: 'none' })
  } catch (e) {
    uni.showToast({ title: '失败', icon: 'none' })
  }
}

const goLogin = () => uni.navigateTo({ url: '/pages/user/login' })
const goShopping = () => uni.switchTab({ url: '/pages/index/index' })
const checkout = () => {
  if (selectedIds.value.length === 0) {
    uni.showToast({ title: '请先选择商品', icon: 'none' })
    return
  }
  uni.setStorageSync('cartSelectedItems', cartItems.value.filter(i => selectedIds.value.includes(i.id)))
  uni.navigateTo({ url: '/pages/order/create' })
}
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background: var(--color-bg);
}

// Auth / Empty shared style
.auth-section, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 40rpx;
  text-align: center;
}
.auth-icon, .empty-icon {
  font-size: 64rpx;
  color: var(--color-gold);
  margin-bottom: 32rpx;
}
.auth-title, .empty-title {
  font-family: var(--font-display);
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 12rpx;
}
.auth-sub, .empty-sub {
  font-size: 26rpx;
  color: var(--color-text-muted);
  font-weight: 300;
  margin-bottom: 40rpx;
}
.auth-btn, .empty-btn {
  padding: 20rpx 64rpx;
  border: 1rpx solid var(--color-primary);
  background: transparent;
  transition: all var(--transition-base);
  &:active {
    background: var(--color-primary);
    text { color: #fff; }
  }
  text {
    font-size: 24rpx;
    font-weight: 600;
    color: var(--color-primary);
    letter-spacing: 4rpx;
  }
}

// Cart Content
.cart-content {
  padding-bottom: 160rpx;
}
.cart-header {
  padding: 28rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1rpx solid var(--color-border-light);
}
.header-title {
  font-family: var(--font-display);
  font-size: 36rpx;
  font-weight: 600;
  color: var(--color-text);
}
.header-count {
  font-size: 24rpx;
  color: var(--color-text-muted);
  font-weight: 300;
}

// Cart Item
.cart-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  margin: 16rpx 24rpx;
  background: var(--color-card);
  border-radius: var(--radius-lg);
}
.item-check {
  padding-right: 16rpx;
}
.check-box {
  width: 40rpx;
  height: 40rpx;
  border: 1.5rpx solid var(--color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  &.checked {
    background: var(--color-primary);
    border-color: var(--color-primary);
    text { color: #fff; font-size: 24rpx; font-weight: 600; }
  }
}
.item-image {
  width: 160rpx;
  height: 200rpx;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface);
  image { width: 100%; height: 100%; }
}
.item-details {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
}
.item-name {
  display: block;
  font-size: 28rpx;
  color: var(--color-text);
  font-weight: 500;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 320rpx;
}
.item-variant {
  display: block;
  font-size: 22rpx;
  color: var(--color-text-muted);
  margin-top: 6rpx;
}
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}
.item-price {
  font-family: var(--font-display);
  font-size: 32rpx;
  font-weight: 700;
  color: var(--color-primary);
}
.qty-stepper {
  display: flex;
  align-items: center;
  border: 1rpx solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.qty-btn {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  &:active { background: var(--color-border); }
}
.qty-val {
  width: 56rpx;
  text-align: center;
  font-size: 26rpx;
  color: var(--color-text);
  font-weight: 500;
}
.item-remove {
  padding: 0 0 0 16rpx;
  text {
    font-size: 36rpx;
    color: var(--color-text-muted);
    font-weight: 300;
  }
}

// Bottom Bar
.bottom-bar {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--color-dark);
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  z-index: 9999;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
.select-all {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.select-label {
  font-size: 22rpx;
  color: var(--color-text-muted);
  letter-spacing: 1rpx;
}
.total-area {
  flex: 1;
  text-align: right;
  margin-right: 24rpx;
}
.total-price {
  font-family: var(--font-display);
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-gold);
}
.total-note {
  display: block;
  font-size: 18rpx;
  color: var(--color-text-muted);
  margin-top: -2rpx;
}
.btn-checkout {
  background: var(--color-gold);
  color: var(--color-dark);
  padding: 0 36rpx;
  height: 68rpx;
  display: flex;
  align-items: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  text {
    font-size: 24rpx;
    font-weight: 600;
    letter-spacing: 2rpx;
  }
  &:active { opacity: 0.9; }
  &.disabled {
    background: var(--color-border);
    text { color: var(--color-text-muted); }
  }
}
</style>
