<template>
  <view class="wholesale-page">
    <!-- Dealer Header -->
    <view class="dealer-header">
      <view class="dh-pattern">◆ ◆ ◆ ◆ ◆ ◆</view>
      <text class="dh-name">{{ dealer.companyName || 'SHOWROOM' }}</text>
      <view class="dh-row">
        <view class="dh-stat">
          <text class="dh-stat-val">{{ dealer.level || 'V1' }}</text>
          <text class="dh-stat-label">等级</text>
        </view>
        <view class="dh-divider"></view>
        <view class="dh-stat">
          <text class="dh-stat-val">¥{{ dealer.creditLine || '—' }}</text>
          <text class="dh-stat-label">额度</text>
        </view>
        <view class="dh-divider"></view>
        <view class="dh-stat">
          <text class="dh-stat-val">¥{{ dealer.usedCredit || 0 }}</text>
          <text class="dh-stat-label">已用</text>
        </view>
      </view>
    </view>

    <!-- Search -->
    <view class="search-bar">
      <input placeholder="搜索批发商品..." placeholder-class="ph" />
    </view>

    <!-- Products -->
    <view class="goods-grid">
      <view v-for="goods in products" :key="goods.id" class="goods-card" @tap="addToCart(goods)">
        <view class="gc-image">
          <image :src="goods.image" mode="aspectFill" />
        </view>
        <view class="gc-info">
          <text class="gc-name">{{ goods.name }}</text>
          <view class="gc-price-row">
            <text class="gc-price">¥{{ goods.dealerPrice }}</text>
            <text class="gc-min">起订 {{ goods.minQty }}{{ goods.unit || '件' }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="nav-orders" @tap="goOrders">
      <text>查看订单 →</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const dealer = ref<any>({
  companyName: 'MILANO SHOWROOM',
  level: 'V1',
  creditLine: '100,000',
  usedCredit: '0'
})
const products = ref<any[]>([])

const addToCart = () => uni.navigateTo({ url: '/pages/wholesale/order' })
const goOrders = () => uni.navigateTo({ url: '/pages/wholesale/orders' })
</script>

<style lang="scss" scoped>
.wholesale-page { min-height: 100vh; background: var(--color-bg); padding-bottom: 40rpx; }

.dealer-header {
  background: var(--color-dark);
  padding: 48rpx 32rpx 40rpx;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.dh-pattern {
  font-size: 16rpx;
  color: rgba(201, 169, 110, 0.15);
  letter-spacing: 4rpx;
  margin-bottom: 16rpx;
}
.dh-name {
  font-family: var(--font-display);
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-gold);
  letter-spacing: 6rpx;
  display: block;
  margin-bottom: 32rpx;
}
.dh-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40rpx;
}
.dh-stat { display: flex; flex-direction: column; align-items: center; gap: 4rpx; }
.dh-stat-val {
  font-family: var(--font-display);
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}
.dh-stat-label { font-size: 18rpx; color: var(--color-text-muted); letter-spacing: 2rpx; }
.dh-divider { width: 1rpx; height: 40rpx; background: rgba(255,255,255,0.1); }

.search-bar {
  padding: 24rpx;
  background: var(--color-card);
  border-bottom: 1rpx solid var(--color-border-light);
  input {
    background: var(--color-surface);
    border-radius: var(--radius-sm);
    padding: 20rpx 24rpx;
    font-size: 28rpx;
    color: var(--color-text);
  }
  .ph { color: var(--color-text-muted); }
}

.goods-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 24rpx 20rpx;
}
.goods-card {
  width: calc(50% - 8rpx);
  background: var(--color-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  &:active { transform: translateY(2rpx); }
}
.gc-image {
  aspect-ratio: 3/4;
  overflow: hidden;
  image { width: 100%; height: 100%; }
}
.gc-info { padding: 20rpx 16rpx 24rpx; }
.gc-name {
  display: block;
  font-size: 26rpx;
  color: var(--color-text);
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.gc-price-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 12rpx;
}
.gc-price {
  font-family: var(--font-display);
  font-size: 32rpx;
  font-weight: 700;
  color: var(--color-primary);
}
.gc-min {
  font-size: 20rpx;
  color: var(--color-text-muted);
}

.nav-orders {
  text-align: center;
  padding: 32rpx;
  font-size: 26rpx;
  color: var(--color-primary);
  font-weight: 500;
}
</style>
