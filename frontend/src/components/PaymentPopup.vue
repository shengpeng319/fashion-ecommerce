<template>
  <view class="pp-overlay" v-if="visible" @tap.stop.prevent="() => {}">
    <view class="pp-mask" @tap="handleCancel"></view>
    <view class="pp-card">
      <view class="pp-header">
        <text class="pp-title">{{ title }}</text>
        <view class="pp-close" @tap="handleCancel">
          <text>✕</text>
        </view>
      </view>

      <view class="pp-amount">
        <text class="pp-amount-label">支付金额</text>
        <text class="pp-amount-value">¥{{ amount }}</text>
      </view>

      <view class="pp-methods">
        <text class="pp-methods-label">选择支付方式</text>
        <view class="pp-method" :class="{ selected: selectedMethod === 'wechat' }" @tap="selectedMethod = 'wechat'">
          <view class="pp-method-icon wechat">微信</view>
          <text class="pp-method-name">微信支付</text>
          <view class="pp-method-radio" :class="{ on: selectedMethod === 'wechat' }">
            <text v-if="selectedMethod === 'wechat'">✓</text>
          </view>
        </view>
        <view class="pp-method" :class="{ selected: selectedMethod === 'alipay' }" @tap="selectedMethod = 'alipay'">
          <view class="pp-method-icon alipay">支</view>
          <text class="pp-method-name">支付宝</text>
          <view class="pp-method-radio" :class="{ on: selectedMethod === 'alipay' }">
            <text v-if="selectedMethod === 'alipay'">✓</text>
          </view>
        </view>
      </view>

      <view class="pp-info">
        <text>模拟支付环境 — 点击确认即完成支付</text>
      </view>

      <view class="pp-btn" :class="{ loading: submitting }" @tap="handleConfirm">
        <text>{{ submitting ? '支付中...' : '确认支付' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  title?: string
  amount: number | string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const selectedMethod = ref('wechat')
const submitting = ref(false)

watch(() => props.visible, (v) => {
  if (v) {
    selectedMethod.value = 'wechat'
    submitting.value = false
  }
})

const handleConfirm = () => {
  if (submitting.value) return
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    emit('confirm')
  }, 1500)
}

const handleCancel = () => {
  if (!submitting.value) {
    emit('cancel')
  }
}
</script>

<style lang="scss" scoped>
.pp-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.pp-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
}
.pp-card {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 32rpx 60rpx;
  z-index: 1;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.pp-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40rpx;
}
.pp-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}
.pp-close {
  position: absolute;
  right: 0;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  text { font-size: 32rpx; color: #999; }
}

.pp-amount {
  text-align: center;
  padding: 40rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 32rpx;
}
.pp-amount-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
}
.pp-amount-value {
  font-size: 64rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.pp-methods {
  margin-bottom: 32rpx;
}
.pp-methods-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
}
.pp-method {
  display: flex;
  align-items: center;
  padding: 28rpx 20rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;
  &.selected { border-color: #c9a96e; background: #fdf9f2; }
}
.pp-method-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
  margin-right: 20rpx;
  &.wechat { background: #07c160; }
  &.alipay { background: #1677ff; }
}
.pp-method-name {
  flex: 1;
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 500;
}
.pp-method-radio {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  &.on { background: #c9a96e; border-color: #c9a96e; text { color: #fff; font-size: 22rpx; } }
}

.pp-info {
  text-align: center;
  margin-bottom: 32rpx;
  text { font-size: 22rpx; color: #bbb; }
}

.pp-btn {
  height: 88rpx;
  background: #c9a96e;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  text { font-size: 28rpx; font-weight: 600; color: #fff; letter-spacing: 4rpx; }
  &:active { opacity: 0.85; }
  &.loading { opacity: 0.7; }
}
</style>
