<template>
  <view class="cart-page">
    <view v-if="!isLoggedIn" class="cart-page__auth">
      <text class="cart-page__auth-icon">🔒</text>
      <text class="cart-page__auth-title">请登录查看购物车</text>
      <text class="cart-page__auth-desc">登录后即可查看和管理您的购物车</text>
      <view class="cart-page__auth-btn" @tap="goLogin">
        <text class="cart-page__auth-btn-text">登录 / 注册</text>
      </view>
    </view>

    <EmptyState
      v-else-if="!loading && cartItems.length === 0"
      icon="🛒"
      title="购物车是空的"
      description="去逛逛，发现心仪好物"
    />

    <template v-else>
      <scroll-view class="cart-page__scroll" scroll-y>
        <view class="cart-page__header">
          <text class="cart-page__header-title">购物车</text>
          <text class="cart-page__header-count">({{ cartItems.length }})</text>
        </view>

        <view
          v-for="item in cartItems"
          :key="item.id"
          class="cart-item"
        >
          <view class="cart-item__check" @tap="toggleItem(item.id)">
            <view class="cart-item__checkbox" :class="{ 'cart-item__checkbox--checked': selectedIds.includes(item.id) }">
              <text v-if="selectedIds.includes(item.id)" class="cart-item__checkmark">✓</text>
            </view>
          </view>

          <image
            class="cart-item__image"
            :src="getItemImage(item)"
            mode="aspectFill"
          />

          <view class="cart-item__info">
            <text class="cart-item__name">{{ item.product?.name }}</text>
            <PriceDisplay
              :price="item.product?.price || 0"
              :originalPrice="item.product?.originalPrice"
            />
            <view class="cart-item__stepper">
              <view
                class="cart-item__stepper-btn"
                :class="{ 'cart-item__stepper-btn--disabled': item.quantity <= 1 }"
                @tap.stop="changeQty(item, -1)"
              >
                <text>−</text>
              </view>
              <text class="cart-item__stepper-val">{{ item.quantity }}</text>
              <view class="cart-item__stepper-btn" @tap.stop="changeQty(item, 1)">
                <text>+</text>
              </view>
            </view>
          </view>

          <view class="cart-item__delete" @tap.stop="deleteItem(item.id)">
            <text class="cart-item__delete-icon">×</text>
          </view>
        </view>
      </scroll-view>

      <view class="cart-page__bottom">
        <view class="cart-page__bottom-left" @tap="toggleSelectAll">
          <view class="cart-item__checkbox" :class="{ 'cart-item__checkbox--checked': allSelected }">
            <text v-if="allSelected" class="cart-item__checkmark">✓</text>
          </view>
          <text class="cart-page__select-all-label">全选</text>
        </view>
        <view class="cart-page__bottom-center">
          <text class="cart-page__total-label">合计：</text>
          <text class="cart-page__total-value">¥{{ totalPrice }}</text>
        </view>
        <view
          class="cart-page__checkout-btn"
          :class="{ 'cart-page__checkout-btn--disabled': selectedIds.length === 0 }"
          @tap="checkout"
        >
          <text class="cart-page__checkout-text">结算({{ selectedIds.length }})</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request, getToken } from '@/utils/request'
import EmptyState from '@/components/EmptyState.vue'
import PriceDisplay from '@/components/PriceDisplay.vue'

const isLoggedIn = ref(false)
const cartItems = ref<any[]>([])
const selectedIds = ref<string[]>([])
const loading = ref(false)

const allSelected = computed(() =>
  cartItems.value.length > 0 && selectedIds.value.length === cartItems.value.length
)

const totalPrice = computed(() =>
  cartItems.value
    .filter(i => selectedIds.value.includes(i.id))
    .reduce((sum, i) => sum + Number(i.product?.price || 0) * i.quantity, 0)
    .toFixed(2)
)

const getItemImage = (item: any) => {
  try {
    const imgs = JSON.parse(item.product?.images || '[]')
    if (imgs.length > 0) return imgs[0]
  } catch {}
  return item.product?.thumbnail || item.product?.image || ''
}

onShow(() => {
  isLoggedIn.value = !!getToken()
  if (isLoggedIn.value) loadCart()
})

const loadCart = async () => {
  loading.value = true
  try {
    const res: any = await request('/cart', 'GET')
    cartItems.value = Array.isArray(res) ? res : (res?.data || [])
    selectedIds.value = cartItems.value.map(i => i.id)
  } catch {
    cartItems.value = []
  } finally {
    loading.value = false
  }
}

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

const changeQty = async (item: any, delta: number) => {
  const newQty = item.quantity + delta
  if (newQty < 1) return
  try {
    await request(`/cart/${item.id}`, 'PUT', { quantity: newQty })
    item.quantity = newQty
  } catch {
    uni.showToast({ title: '更新失败', icon: 'none' })
  }
}

const deleteItem = async (id: string) => {
  try {
    await request(`/cart/${id}`, 'DELETE')
    cartItems.value = cartItems.value.filter(i => i.id !== id)
    selectedIds.value = selectedIds.value.filter(sid => sid !== id)
    uni.showToast({ title: '已移除', icon: 'none' })
  } catch {
    uni.showToast({ title: '删除失败', icon: 'none' })
  }
}

const goLogin = () => uni.navigateTo({ url: '/pages/user/login' })

const checkout = () => {
  if (selectedIds.value.length === 0) {
    uni.showToast({ title: '请先选择商品', icon: 'none' })
    return
  }
  uni.setStorageSync(
    'cartSelectedItems',
    cartItems.value.filter(i => selectedIds.value.includes(i.id))
  )
  uni.navigateTo({ url: '/pages/order/create' })
}
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background: var(--bg-secondary);

  &__auth {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 200rpx 80rpx;
  }

  &__auth-icon {
    font-size: 96rpx;
  }

  &__auth-title {
    font-size: 34rpx;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: var(--space-4);
  }

  &__auth-desc {
    font-size: 26rpx;
    color: var(--text-quaternary);
    margin-top: var(--space-2);
  }

  &__auth-btn {
    margin-top: var(--space-6);
    padding: 20rpx 80rpx;
    background: var(--accent);
    border-radius: var(--radius-full);
  }

  &__auth-btn-text {
    font-size: 28rpx;
    font-weight: 500;
    color: #ffffff;
  }

  &__scroll {
    height: calc(100vh - 120rpx);
    padding-bottom: 200rpx;
  }

  &__header {
    display: flex;
    align-items: baseline;
    padding: var(--space-4);
    background: var(--bg-primary);
    border-bottom: 1rpx solid var(--border);
  }

  &__header-title {
    font-size: 34rpx;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__header-count {
    font-size: 24rpx;
    color: var(--text-quaternary);
    margin-left: var(--space-1);
  }

  &__bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    background: var(--bg-primary);
    padding: var(--space-3) var(--space-4);
    padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom));
    box-shadow: var(--shadow-nav);
    z-index: 100;
  }

  &__bottom-left {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  &__select-all-label {
    font-size: 24rpx;
    color: var(--text-tertiary);
  }

  &__bottom-center {
    flex: 1;
    text-align: right;
    margin-right: var(--space-3);
  }

  &__total-label {
    font-size: 24rpx;
    color: var(--text-tertiary);
  }

  &__total-value {
    font-size: 36rpx;
    font-weight: 700;
    color: var(--accent);
  }

  &__checkout-btn {
    background: var(--accent);
    border-radius: var(--radius-full);
    padding: 18rpx 40rpx;

    &--disabled {
      background: var(--bg-tertiary);

      .cart-page__checkout-text {
        color: var(--text-quaternary);
      }
    }
  }

  &__checkout-text {
    font-size: 28rpx;
    font-weight: 600;
    color: #ffffff;
  }
}

.cart-item {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  margin-top: 1rpx;
  background: var(--bg-primary);

  &__check {
    padding-right: var(--space-2);
  }

  &__checkbox {
    width: 40rpx;
    height: 40rpx;
    border: 2rpx solid var(--border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);

    &--checked {
      background: var(--accent);
      border-color: var(--accent);
    }
  }

  &__checkmark {
    font-size: 22rpx;
    color: #ffffff;
    font-weight: 600;
  }

  &__image {
    width: 120rpx;
    height: 120rpx;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
    background: var(--bg-tertiary);
  }

  &__info {
    flex: 1;
    margin-left: var(--space-3);
    min-width: 0;
  }

  &__name {
    display: block;
    font-size: 28rpx;
    color: var(--text-primary);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__stepper {
    display: flex;
    align-items: center;
    margin-top: var(--space-2);
    border: 1rpx solid var(--border);
    border-radius: var(--radius-xs);
    width: fit-content;
  }

  &__stepper-btn {
    width: 52rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    font-size: 28rpx;
    color: var(--text-secondary);

    &--disabled {
      opacity: 0.3;
    }
  }

  &__stepper-val {
    width: 56rpx;
    text-align: center;
    font-size: 26rpx;
    color: var(--text-primary);
    font-weight: 500;
  }

  &__delete {
    padding: var(--space-2) 0 var(--space-2) var(--space-2);
  }

  &__delete-icon {
    font-size: 36rpx;
    color: var(--text-quaternary);
    font-weight: 300;
  }
}
</style>
