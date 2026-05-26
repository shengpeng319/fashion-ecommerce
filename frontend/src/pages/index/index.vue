<template>
  <view class="home">
    <!-- Hero Banner -->
    <swiper class="hero" indicator-dots autoplay circular interval="5000"
      indicator-color="rgba(255,255,255,0.3)" indicator-active-color="#C9A96E">
      <swiper-item v-for="(item, idx) in banners" :key="idx" @tap="goGoods(item.goodsId)" v-if="item.goodsId">
        <image :src="item.image" mode="aspectFill" class="hero-img" />
      </swiper-item>
    </swiper>

    <!-- Brand Statement -->
    <view class="brand">
      <view class="brand-diamond">◆</view>
      <text class="brand-title">NUOVA COLLEZIONE</text>
      <text class="brand-sub">Spring / Summer 2026</text>
      <view class="brand-line"></view>
      <text class="brand-desc">Italian craftsmanship meets contemporary elegance</text>
    </view>

    <!-- Category Ribbon -->
    <scroll-view scroll-x class="cat-scroll" :show-scrollbar="false">
      <view class="cat-ribbon">
        <view v-for="cat in categories" :key="cat.id" class="cat-chip"
          @tap="goCategory(cat.id)">
          <text class="cat-chip-text">{{ cat.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Featured Hero Product -->
    <view class="featured" v-if="featuredGoods" @tap="goGoods(featuredGoods.id)">
      <image :src="getImage(featuredGoods)" mode="aspectFill" class="featured-img" />
      <view class="featured-overlay">
        <text class="featured-label">编辑精选</text>
        <text class="featured-name">{{ featuredGoods.name }}</text>
        <text class="featured-price">¥{{ featuredGoods.price }}</text>
      </view>
    </view>

    <!-- New Arrivals -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">新品上市</text>
        <text class="section-more" @tap="goCategory('')">查看全部 →</text>
      </view>
      <view class="goods-grid">
        <view v-for="goods in newArrivals" :key="goods.id" class="goods-card" @tap="goGoods(goods.id)">
          <view class="goods-img-box">
            <image :src="getImage(goods)" mode="aspectFill" class="goods-img" />
            <view class="goods-tag" v-if="goods.originalPrice && goods.originalPrice > goods.price">
              折扣
            </view>
          </view>
          <view class="goods-meta">
            <text class="goods-name">{{ goods.name }}</text>
            <text class="goods-sub" v-if="goods.subtitle">{{ goods.subtitle }}</text>
            <view class="goods-price-row">
              <text class="goods-price">¥{{ goods.price }}</text>
              <text class="goods-original" v-if="goods.originalPrice && goods.originalPrice > goods.price">
                ¥{{ goods.originalPrice }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Footer -->
    <view class="footer">
      <text class="footer-brand">FASHION</text>
      <text class="footer-tagline">Milano · Paris · Shanghai</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

const banners = ref<any[]>([])
const categories = ref<any[]>([])
const featuredGoods = ref<any>(null)
const newArrivals = ref<any[]>([])

const getImage = (goods: any) => {
  try { return JSON.parse(goods.images)[0] } catch { return '' }
}

onLoad(async () => {
  try {
    const res: any = await request('/products', 'GET')
    const all = res.data || res || []
    newArrivals.value = all.slice(0, 6)
    if (all.length > 0) {
      featuredGoods.value = all[0]
      // Use product images as banners
      banners.value = all.slice(0, 3).map((g: any) => ({
        image: getImage(g),
        goodsId: g.id
      }))
    }
    const catRes: any = await request('/categories', 'GET')
    categories.value = (catRes || []).slice(0, 8)
  } catch (e) {
    console.error('load error', e)
  }
})

const goCategory = (id: string) => {
  uni.switchTab({ url: `/pages/category/index?categoryId=${id || ''}` })
}

const goGoods = (id: string) => {
  uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
}
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  background: var(--color-bg);
}

// Hero Banner
.hero {
  height: 900rpx;
  .hero-img {
    width: 100%;
    height: 100%;
  }
}

// Brand Statement
.brand {
  padding: 60rpx 40rpx 48rpx;
  text-align: center;
  background: var(--color-dark);
  color: var(--color-text-inverse);
}
.brand-diamond {
  font-size: 24rpx;
  color: var(--color-gold);
  margin-bottom: 20rpx;
  letter-spacing: 24rpx;
}
.brand-title {
  display: block;
  font-family: var(--font-display);
  font-size: 44rpx;
  font-weight: 700;
  letter-spacing: 8rpx;
  color: var(--color-text-inverse);
  margin-bottom: 12rpx;
}
.brand-sub {
  display: block;
  font-family: var(--font-display);
  font-size: 24rpx;
  font-weight: 400;
  font-style: italic;
  color: var(--color-gold-light);
  letter-spacing: 4rpx;
  margin-bottom: 32rpx;
}
.brand-line {
  width: 60rpx;
  height: 2rpx;
  background: var(--color-gold);
  margin: 0 auto 24rpx;
}
.brand-desc {
  display: block;
  font-size: 24rpx;
  color: var(--color-text-muted);
  letter-spacing: 2rpx;
  font-weight: 300;
}

// Category Ribbon
.cat-scroll {
  background: var(--color-card);
  border-bottom: 1rpx solid var(--color-border-light);
}
.cat-ribbon {
  display: flex;
  padding: 28rpx 24rpx;
  gap: 16rpx;
}
.cat-chip {
  flex-shrink: 0;
  padding: 14rpx 32rpx;
  border: 1rpx solid var(--color-border);
  border-radius: 40rpx;
  background: transparent;
  transition: all var(--transition-base);
  &:active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    .cat-chip-text { color: #fff; }
  }
}
.cat-chip-text {
  font-size: 26rpx;
  color: var(--color-text);
  font-weight: 500;
  font-family: var(--font-body);
  letter-spacing: 0.5rpx;
}

// Featured Hero Product
.featured {
  position: relative;
  margin: 32rpx 24rpx;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  &:active { transform: scale(0.98); }
}
.featured-img {
  width: 100%;
  height: 520rpx;
  display: block;
}
.featured-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 60rpx 32rpx 32rpx;
  background: linear-gradient(to top, rgba(26,21,20,0.85), transparent);
}
.featured-label {
  display: block;
  font-size: 20rpx;
  color: var(--color-gold);
  letter-spacing: 4rpx;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8rpx;
}
.featured-name {
  display: block;
  font-family: var(--font-display);
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12rpx;
}
.featured-price {
  font-family: var(--font-display);
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-gold);
}

// Section
.section {
  padding: 0 24rpx 40rpx;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 40rpx 0 24rpx;
}
.section-title {
  font-family: var(--font-display);
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 2rpx;
}
.section-more {
  font-size: 24rpx;
  color: var(--color-text-muted);
  font-weight: 400;
}

// Goods Grid
.goods-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}
.goods-card {
  width: calc(50% - 12rpx);
  background: var(--color-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  &:active {
    transform: translateY(2rpx);
    box-shadow: var(--shadow-md);
  }
}
.goods-img-box {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  background: var(--color-surface);
}
.goods-img {
  width: 100%;
  height: 100%;
  display: block;
  transition: transform 0.4s ease;
}
.goods-tag {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--color-primary);
  color: #fff;
  font-size: 18rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  padding: 6rpx 16rpx;
}
.goods-meta {
  padding: 20rpx 16rpx 24rpx;
}
.goods-name {
  display: block;
  font-size: 26rpx;
  color: var(--color-text);
  font-weight: 500;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goods-sub {
  display: block;
  font-size: 22rpx;
  color: var(--color-text-muted);
  margin-top: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goods-price-row {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
  margin-top: 14rpx;
}
.goods-price {
  font-family: var(--font-display);
  font-size: 32rpx;
  font-weight: 700;
  color: var(--color-primary);
}
.goods-original {
  font-family: var(--font-display);
  font-size: 22rpx;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

// Footer
.footer {
  padding: 64rpx 40rpx 80rpx;
  text-align: center;
  background: var(--color-dark);
}
.footer-brand {
  display: block;
  font-family: var(--font-display);
  font-size: 40rpx;
  font-weight: 700;
  color: var(--color-gold);
  letter-spacing: 8rpx;
  margin-bottom: 12rpx;
}
.footer-tagline {
  font-size: 20rpx;
  color: var(--color-text-muted);
  letter-spacing: 4rpx;
}
</style>
