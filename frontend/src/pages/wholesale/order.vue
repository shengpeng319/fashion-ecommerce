<template>
  <view class="wo-page">
    <view class="wo-tip">
      <text>订单提交后将进行审核</text>
    </view>

    <view class="wo-items">
      <view v-for="item in items" :key="item.id" class="wo-item">
        <image :src="item.image" mode="aspectFill" class="wo-img" />
        <view class="wo-info">
          <text class="wo-name">{{ item.name }}</text>
          <text class="wo-price">¥{{ item.dealerPrice }} × {{ item.quantity }} = ¥{{ item.dealerPrice * item.quantity }}</text>
        </view>
        <view class="wo-qty">
          <text class="wo-qty-btn" @tap="changeQty(item, -1)">−</text>
          <text class="wo-qty-val">{{ item.quantity }}</text>
          <text class="wo-qty-btn" @tap="changeQty(item, 1)">+</text>
        </view>
      </view>
    </view>

    <view class="wo-remark">
      <input v-model="remark" placeholder="订单备注（选填）" placeholder-class="ph" />
    </view>

    <view class="wo-footer">
      <view class="wo-total">
        <text class="wo-total-label">合计</text>
        <text class="wo-total-price">¥{{ total }}</text>
      </view>
      <view class="wo-submit" @tap="showPayment = true">
        <text>提交订单</text>
      </view>
    </view>

    <!-- Payment Popup -->
    <PaymentPopup
      :visible="showPayment"
      title="批发订单支付"
      :amount="total"
      @confirm="handlePaymentConfirm"
      @cancel="showPayment = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PaymentPopup from '@/components/PaymentPopup.vue'

const items = ref<any[]>([])
const remark = ref('')
const showPayment = ref(false)
const total = computed(() => items.value.reduce((sum, i) => sum + i.dealerPrice * i.quantity, 0).toFixed(2))

const changeQty = (item: any, delta: number) => {
  const q = item.quantity + delta
  if (q < 1) return
  item.quantity = q
}

const handlePaymentConfirm = () => {
  showPayment.value = false
  uni.showToast({ title: '已提交订单' })
  setTimeout(() => uni.navigateBack(), 1000)
}
</script>

<style lang="scss" scoped>
.wo-page { min-height: 100vh; padding-bottom: 140rpx; background: var(--color-bg); }

.wo-tip {
  margin: 24rpx;
  padding: 24rpx;
  background: var(--color-surface);
  border-left: 4rpx solid var(--color-gold);
  text { font-size: 24rpx; color: var(--color-text-secondary); font-weight: 400; }
}

.wo-items {
  background: var(--color-card);
  margin: 0 24rpx;
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.wo-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid var(--color-divider);
  &:last-child { border-bottom: none; }
}
.wo-img {
  width: 140rpx;
  height: 170rpx;
  border-radius: var(--radius-sm);
  margin-right: 20rpx;
}
.wo-info { flex: 1; min-width: 0; }
.wo-name {
  display: block;
  font-size: 28rpx;
  color: var(--color-text);
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.wo-price {
  display: block;
  font-size: 24rpx;
  color: var(--color-primary);
  font-weight: 600;
  margin-top: 8rpx;
}
.wo-qty {
  display: flex;
  align-items: center;
  border: 1rpx solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-left: 16rpx;
}
.wo-qty-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  &:active { opacity: 0.7; }
}
.wo-qty-val {
  width: 56rpx;
  text-align: center;
  font-size: 26rpx;
  color: var(--color-text);
  font-weight: 500;
}

.wo-remark {
  margin: 24rpx;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 24rpx;
  input {
    width: 100%;
    font-size: 28rpx;
    color: var(--color-text);
  }
  .ph { color: var(--color-text-muted); }
}

.wo-footer {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--color-dark);
  padding: 16rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.wo-total { display: flex; align-items: baseline; gap: 12rpx; }
.wo-total-label { font-size: 22rpx; color: var(--color-text-muted); letter-spacing: 2rpx; }
.wo-total-price {
  font-family: var(--font-display);
  font-size: 40rpx;
  font-weight: 700;
  color: var(--color-gold);
}
.wo-submit {
  background: var(--color-gold);
  padding: 0 40rpx;
  height: 68rpx;
  display: flex;
  align-items: center;
  border-radius: var(--radius-sm);
  &:active { opacity: 0.85; }
  text { font-size: 24rpx; font-weight: 600; color: var(--color-dark); letter-spacing: 2rpx; }
}
</style>
