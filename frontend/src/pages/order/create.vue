<template>
  <view class="order-create-page">
    <view class="addr-card" @tap="goSelectAddress">
      <view v-if="address" class="addr-filled">
        <text class="addr-name">{{ address.name }}  {{ address.phone }}</text>
        <text class="addr-detail">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}</text>
      </view>
      <view v-else class="addr-empty">
        <text class="addr-plus">+</text>
        <text class="addr-hint">添加收货地址</text>
      </view>
      <text class="addr-arrow">›</text>
    </view>

    <view class="items-card" v-if="orderItems.length">
      <view v-for="item in orderItems" :key="item.id || item.productId" class="ic-item">
        <image :src="getImg(item)" mode="aspectFill" class="ic-img" />
        <view class="ic-info">
          <text class="ic-name">{{ item.product?.name }}</text>
          <text class="ic-sku" v-if="item.sku?.name">{{ item.sku.name }}</text>
          <view class="ic-bottom">
            <PriceDisplay :price="Number(item.product?.price || 0)" />
            <text class="ic-qty">×{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="points-card" v-if="isLoggedIn && memberPoints > 0">
      <view class="pc-header">
        <text class="pc-label">积分抵扣</text>
        <text class="pc-balance">{{ memberPoints }} 积分可用</text>
      </view>
      <view class="pc-row" v-if="usePoints">
        <input v-model="pointsToUse" type="number" placeholder="请输入抵扣积分" placeholder-class="input-ph" class="pc-input" />
        <text class="pc-hint">（1积分=1元）</text>
      </view>
      <view class="pc-toggle" @tap="usePoints = !usePoints">
        <view class="pc-switch" :class="{ on: usePoints }">
          <view class="pc-switch-dot"></view>
        </view>
        <text class="pc-switch-label">{{ usePoints ? '已开启积分抵扣' : '开启积分抵扣' }}</text>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="bb-total">
        <text class="bb-label">合计</text>
        <text class="bb-price">¥{{ displayTotal }}</text>
        <text class="bb-discount" v-if="pointsUsed > 0">（已抵扣¥{{ pointsUsed }}）</text>
      </view>
      <view class="bb-btn" @tap="submitOrder">
        <text class="bb-btn-text">提交订单</text>
      </view>
    </view>

    <PaymentPopup
      :visible="showPayment"
      title="确认支付"
      :amount="displayTotal"
      @confirm="handlePaymentConfirm"
      @cancel="showPayment = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request, getToken } from '@/utils/request'
import PaymentPopup from '@/components/PaymentPopup.vue'
import PriceDisplay from '@/components/PriceDisplay.vue'

const address = ref<any>(null)
const orderItems = ref<any[]>([])
const isLoggedIn = ref(false)
const memberPoints = ref(0)
const usePoints = ref(false)
const pointsToUse = ref('0')
const showPayment = ref(false)
const pendingOrderId = ref('')

const getImg = (item: any) => {
  try { return JSON.parse(item.product?.images || '[]')[0] } catch { return '' }
}

const total = computed(() =>
  orderItems.value.reduce((sum, i: any) => sum + Number(i.product?.price || 0) * i.quantity, 0).toFixed(2)
)

const pointsUsed = computed(() => {
  if (!usePoints.value) return 0
  const pts = parseInt(pointsToUse.value) || 0
  const max = Math.min(pts, memberPoints.value, Math.floor(Number(total.value)))
  return Math.max(0, max)
})

const displayTotal = computed(() => {
  return (Number(total.value) - pointsUsed.value).toFixed(2)
})

const loadMember = async () => {
  try {
    const member = await request('/member/profile', 'GET')
    memberPoints.value = member.points || 0
  } catch (e) {}
}

onShow(() => {
  isLoggedIn.value = !!getToken()
  if (!isLoggedIn.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/user/login' }), 1000)
    return
  }

  loadMember()

  const saved = uni.getStorageSync('selectedAddress')
  if (saved) { address.value = saved; uni.removeStorageSync('selectedAddress') }

  const cartSelected = uni.getStorageSync('cartSelectedItems')
  if (cartSelected) { orderItems.value = cartSelected; uni.removeStorageSync('cartSelectedItems') }

  const pages = getCurrentPages()
  const opts = pages[pages.length - 1].options
  if (opts?.productId) loadProduct(opts.productId)
})

const loadProduct = async (productId: string) => {
  try {
    const product: any = await request(`/products/${productId}`, 'GET')
    orderItems.value = [{ id: 'direct', product, quantity: 1 }]
    } catch (e) { uni.showToast({ title: '加载商品失败', icon: 'none' }) }
}

const goSelectAddress = () => {
  uni.navigateTo({ url: '/pages/address/list?mode=select' })
}

const submitOrder = async () => {
  if (!orderItems.value.length) {
    uni.showToast({ title: '没有商品', icon: 'none' }); return
  }
  if (!address.value) {
    uni.showToast({ title: '请添加收货地址', icon: 'none' }); return
  }
  try {
    const items = orderItems.value.map((i: any) => ({
      productId: i.product.id, skuId: i.sku?.id || null, quantity: i.quantity
    }))
    const res: any = await request('/orders', 'POST', {
      addressId: address.value.id,
      items,
      pointsUsed: pointsUsed.value || 0
    })
    pendingOrderId.value = res.id
    showPayment.value = true
  } catch (e: any) {
    uni.showToast({ title: e.error || '失败', icon: 'none' })
  }
}

const handlePaymentConfirm = async () => {
  showPayment.value = false
  uni.showLoading({ title: '支付处理中...' })
  try {
    await request(`/orders/${pendingOrderId.value}/pay`, 'POST')
  } catch (e) {}
  uni.hideLoading()
  uni.showToast({ title: '下单成功！', icon: 'success' })
  setTimeout(() => uni.navigateTo({ url: '/pages/order/list' }), 1500)
}
</script>

<style lang="scss" scoped>
.order-create-page {
  min-height: 100vh;
  padding-bottom: 140rpx;
  background: var(--bg-secondary, #F5F5F5);
}

.addr-card {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background: #FFFFFF;
  margin-bottom: 16rpx;
}

.addr-filled {
  flex: 1;
}

.addr-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
}

.addr-detail {
  display: block;
  font-size: 24rpx;
  color: var(--text-tertiary, #666666);
  margin-top: 8rpx;
  line-height: 1.4;
}

.addr-empty {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.addr-plus {
  font-size: 36rpx;
  color: var(--accent, #C8102E);
  font-weight: 300;
}

.addr-hint {
  font-size: 28rpx;
  color: var(--accent, #C8102E);
}

.addr-arrow {
  font-size: 32rpx;
  color: var(--text-quaternary, #999999);
}

.items-card {
  background: #FFFFFF;
  padding: 8rpx 0;
  margin-bottom: 16rpx;
}

.ic-item {
  display: flex;
  padding: 24rpx 32rpx;
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
  align-items: center;
  margin-top: 16rpx;
}

.ic-qty {
  font-size: 26rpx;
  color: var(--text-quaternary, #999999);
}

.points-card {
  background: #FFFFFF;
  padding: 28rpx 32rpx;
  margin-bottom: 16rpx;
}

.pc-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20rpx;
}

.pc-label {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
}

.pc-balance {
  font-size: 22rpx;
  color: var(--accent, #C8102E);
  font-weight: 500;
}

.pc-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.pc-input {
  flex: 1;
  height: 68rpx;
  background: var(--bg-secondary, #F5F5F5);
  border-radius: var(--radius-sm, 8rpx);
  padding: 0 20rpx;
  font-size: 28rpx;
  color: var(--text-primary, #1A1A1A);
}

.input-ph {
  color: var(--text-quaternary, #999999);
  font-size: 26rpx;
}

.pc-hint {
  font-size: 22rpx;
  color: var(--text-quaternary, #999999);
  flex-shrink: 0;
}

.pc-toggle {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.pc-switch {
  width: 88rpx;
  height: 48rpx;
  background: var(--bg-tertiary, #EFEFEF);
  border-radius: 24rpx;
  position: relative;
  transition: background 0.2s;

  &.on {
    background: var(--accent, #C8102E);
  }
}

.pc-switch-dot {
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  width: 40rpx;
  height: 40rpx;
  background: #FFFFFF;
  border-radius: 50%;
  transition: left 0.2s;

  .on & {
    left: 44rpx;
  }
}

.pc-switch-label {
  font-size: 24rpx;
  color: var(--text-secondary, #333333);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32rpx;
  z-index: 999;
  box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.bb-total {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.bb-label {
  font-size: 26rpx;
  color: var(--text-tertiary, #666666);
}

.bb-price {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--accent, #C8102E);
}

.bb-discount {
  font-size: 18rpx;
  color: var(--text-quaternary, #999999);
}

.bb-btn {
  background: var(--accent, #C8102E);
  padding: 0 48rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;

  &:active {
    opacity: 0.85;
  }
}

.bb-btn-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #FFFFFF;
}
</style>
