<template>
  <view class="detail-page">
    <!-- Gallery -->
    <view class="gallery-wrap">
      <swiper class="gallery" indicator-dots autoplay circular
        indicator-color="rgba(255,255,255,0.3)" indicator-active-color="#C9A96E">
        <swiper-item v-for="(img, i) in images" :key="i">
          <image :src="img" mode="aspectFill" class="gallery-img" />
        </swiper-item>
      </swiper>
      <view class="gallery-counter" v-if="images.length > 1">
        <text>{{ currentIdx + 1 }} / {{ images.length }}</text>
      </view>
      <view class="nav-back" @tap="goBack">
        <text>←</text>
      </view>
    </view>

    <!-- Product Info -->
    <view class="info-section" v-if="goods.id">
      <view class="info-header">
        <view class="price-block">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ goods.price }}</text>
        </view>
        <view class="discount-row" v-if="goods.originalPrice && goods.originalPrice > goods.price">
          <text class="price-original">¥{{ goods.originalPrice }}</text>
          <text class="discount-badge" v-if="discount">{{ discount }}折</text>
        </view>
      </view>

      <text class="product-name">{{ goods.name }}</text>
      <text class="product-sub" v-if="goods.subtitle">{{ goods.subtitle }}</text>

      <view class="meta-strip">
        <view class="meta-item">
          <text class="meta-icon">◆</text>
          <text>正品保证</text>
        </view>
        <view class="meta-item">
          <text class="meta-icon">◆</text>
          <text>7天退换</text>
        </view>
        <view class="meta-item" :class="{ out: goods.stock <= 0 }">
          <text class="meta-icon">{{ goods.stock > 0 ? '◆' : '◇' }}</text>
          <text>{{ goods.stock > 0 ? '有货' : '缺货' }}</text>
        </view>
      </view>
    </view>

    <!-- Description -->
    <view class="desc-section" v-if="goods.description">
      <view class="desc-header">
        <text class="desc-title">LA DESCRIZIONE</text>
        <view class="desc-line"></view>
      </view>
      <text class="desc-text">{{ goods.description }}</text>
    </view>

    <!-- Detail Content -->
    <view class="detail-section" v-if="goods.detail">
      <view class="desc-header">
        <text class="desc-title">DETTAGLI</text>
        <view class="desc-line"></view>
      </view>
      <rich-text :nodes="goods.detail" class="detail-content"></rich-text>
    </view>

    <!-- Spacer for bottom bar -->
    <view style="height: 160rpx;"></view>

    <!-- Bottom Action Bar -->
    <view class="bottom-bar">
      <view class="bottom-actions">
        <view class="bottom-icon" @tap="goHome">
          <text class="bi-icon">⌂</text>
          <text class="bi-label">首页</text>
        </view>
        <view class="bottom-icon" @tap="toggleFavorite">
          <text class="bi-icon">{{ isFavorite ? '♥' : '♡' }}</text>
          <text class="bi-label">收藏</text>
        </view>
        <view class="bottom-icon" @tap="goCart">
          <text class="bi-icon">□</text>
          <text class="bi-label">购物袋</text>
        </view>
      </view>
      <view class="bottom-btns">
        <view class="btn-secondary" @tap="addCart" v-if="goods.stock > 0">
          <text>加入购物袋</text>
        </view>
        <view class="btn-primary" @tap="buyNow" v-if="goods.stock > 0">
          <text>立即购买</text>
        </view>
        <view class="btn-soldout" v-if="goods.stock <= 0">
          <text>已售罄</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

const goods = ref<any>({})
const isFavorite = ref(false)
const currentIdx = ref(0)

const images = computed(() => {
  if (!goods.value.images) return []
  try { return JSON.parse(goods.value.images) } catch { return [] }
})

const discount = computed(() => {
  if (!goods.value.price || !goods.value.originalPrice) return null
  return Math.round((Number(goods.value.price) / Number(goods.value.originalPrice)) * 10)
})

onLoad(async (opt: any) => {
  if (opt.id) {
    try {
      goods.value = await request(`/products/${opt.id}`, 'GET')
    } catch (e) {
      uni.showToast({ title: '加载失败', icon: 'none' })
    }
  }
})

const goBack = () => uni.navigateBack()
const goHome = () => uni.switchTab({ url: '/pages/index/index' })
const goCart = () => uni.switchTab({ url: '/pages/cart/index' })

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  uni.showToast({ title: isFavorite.value ? '已收藏' : '已取消收藏', icon: 'none' })
}

const addCart = () => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/user/login' }), 1000)
    return
  }
  request('/cart', 'POST', { productId: goods.value.id, quantity: 1 })
    .then(() => uni.showToast({ title: '已加入购物袋' }))
    .catch(() => uni.showToast({ title: '失败', icon: 'none' }))
}

const buyNow = () => {
  uni.navigateTo({ url: `/pages/order/create?productId=${goods.value.id}` })
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: var(--color-bg);
}

// Gallery
.gallery-wrap {
  position: relative;
}
.gallery {
  height: 1000rpx;
  background: var(--color-dark);
}
.gallery-img {
  width: 100%;
  height: 100%;
}
.gallery-counter {
  position: absolute;
  bottom: 40rpx;
  right: 32rpx;
  background: rgba(26, 21, 20, 0.6);
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  font-size: 22rpx;
  color: #fff;
  font-weight: 500;
}
.nav-back {
  position: absolute;
  top: 80rpx;
  left: 24rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 21, 20, 0.5);
  border-radius: 50%;
  color: #fff;
  font-size: 32rpx;
  backdrop-filter: blur(10px);
}

// Product Info
.info-section {
  background: var(--color-dark);
  padding: 40rpx 32rpx 48rpx;
  color: var(--color-text-inverse);
}
.info-header {
  display: flex;
  align-items: baseline;
  gap: 20rpx;
  margin-bottom: 24rpx;
}
.price-block {
  display: flex;
  align-items: baseline;
}
.price-symbol {
  font-family: var(--font-display);
  font-size: 32rpx;
  color: var(--color-gold);
  font-weight: 600;
  margin-right: 4rpx;
}
.price-value {
  font-family: var(--font-display);
  font-size: 60rpx;
  font-weight: 700;
  color: var(--color-gold);
  letter-spacing: 2rpx;
}
.discount-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.price-original {
  font-family: var(--font-display);
  font-size: 24rpx;
  color: var(--color-text-muted);
  text-decoration: line-through;
}
.discount-badge {
  font-size: 20rpx;
  color: var(--color-gold);
  border: 1rpx solid var(--color-gold);
  padding: 2rpx 12rpx;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.product-name {
  display: block;
  font-family: var(--font-display);
  font-size: 38rpx;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
  margin-bottom: 8rpx;
}
.product-sub {
  display: block;
  font-size: 26rpx;
  color: var(--color-text-muted);
  font-weight: 300;
  margin-bottom: 32rpx;
}

.meta-strip {
  display: flex;
  gap: 32rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid rgba(255,255,255,0.1);
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: var(--color-text-muted);
  font-weight: 400;
  letter-spacing: 0.5rpx;
  &.out { opacity: 0.5; }
}
.meta-icon {
  font-size: 16rpx;
  color: var(--color-gold);
}

// Description
.desc-section {
  padding: 48rpx 32rpx 40rpx;
  background: var(--color-card);
  border-bottom: 1rpx solid var(--color-border-light);
}
.desc-header {
  text-align: center;
  margin-bottom: 32rpx;
}
.desc-title {
  font-family: var(--font-display);
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 6rpx;
}
.desc-line {
  width: 40rpx;
  height: 2rpx;
  background: var(--color-gold);
  margin: 16rpx auto 0;
}
.desc-text {
  display: block;
  font-size: 28rpx;
  color: var(--color-text-secondary);
  line-height: 1.8;
  font-weight: 300;
}

// Detail
.detail-section {
  padding: 48rpx 32rpx 40rpx;
  background: var(--color-card);
}
.detail-content {
  font-size: 26rpx;
  color: var(--color-text-secondary);
  line-height: 1.8;
}

// Bottom Bar
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-dark);
  padding: 16rpx 32rpx calc(16rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 24rpx;
  z-index: 100;
  border-top: 1rpx solid rgba(255,255,255,0.08);
}
.bottom-actions {
  display: flex;
  gap: 28rpx;
}
.bottom-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bi-icon {
  font-size: 36rpx;
  color: var(--color-text-muted);
}
.bi-label {
  font-size: 18rpx;
  color: var(--color-text-muted);
  margin-top: 2rpx;
  letter-spacing: 1rpx;
}
.bottom-btns {
  flex: 1;
  display: flex;
  gap: 16rpx;
}
.btn-primary, .btn-secondary, .btn-soldout {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 3rpx;
  transition: all var(--transition-base);
  &:active { transform: scale(0.96); opacity: 0.9; }
}
.btn-secondary {
  border: 1rpx solid var(--color-gold);
  color: var(--color-gold);
  background: transparent;
}
.btn-primary {
  background: var(--color-gold);
  color: var(--color-dark);
}
.btn-soldout {
  flex: 2;
  background: rgba(255,255,255,0.05);
  color: var(--color-text-muted);
  border: 1rpx solid rgba(255,255,255,0.1);
  letter-spacing: 6rpx;
}
</style>
