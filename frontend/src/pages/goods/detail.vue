<template>
  <view class="detail">
    <view class="detail-gallery">
      <swiper class="gallery-swiper" indicator-dots circular
        indicator-color="rgba(0,0,0,0.2)" indicator-active-color="#C8102E"
        @change="onSwiperChange">
        <swiper-item v-for="(img, i) in images" :key="i">
          <image :src="img" mode="aspectFill" class="gallery-img" />
        </swiper-item>
      </swiper>
      <view class="gallery-counter" v-if="images.length > 1">
        {{ currentImg + 1 }} / {{ images.length }}
      </view>
      <view class="nav-back" @tap="goBack">
        <text class="nav-back-icon">‹</text>
      </view>
    </view>

    <view class="detail-info" v-if="goods.id">
      <view class="info-price-row">
        <PriceDisplay :price="goods.price" :original-price="goods.originalPrice" size="large" />
        <view class="discount-tag" v-if="discount">-{{ discount }}%</view>
      </view>
      <text class="info-name">{{ goods.name }}</text>
      <text class="info-subtitle" v-if="goods.subtitle">{{ goods.subtitle }}</text>

      <view class="info-meta">
        <view class="meta-item">
          <text class="meta-dot">●</text>
          <text class="meta-text">正品保证</text>
        </view>
        <view class="meta-item">
          <text class="meta-dot">●</text>
          <text class="meta-text">7天退换</text>
        </view>
        <view class="meta-item" :class="{ out: goods.stock <= 0 }">
          <text class="meta-dot">{{ goods.stock > 0 ? '●' : '○' }}</text>
          <text class="meta-text">{{ goods.stock > 0 ? '有货' : '缺货' }}</text>
        </view>
        <view class="meta-item" v-if="goods.sales">
          <text class="meta-text">已售 {{ goods.sales }}</text>
        </view>
      </view>
    </view>

    <view class="detail-desc" v-if="goods.description">
      <view class="desc-divider"></view>
      <text class="desc-label">商品描述</text>
      <text class="desc-text">{{ goods.description }}</text>
    </view>

    <view class="detail-content" v-if="goods.detail">
      <view class="desc-divider"></view>
      <text class="desc-label">商品详情</text>
      <rich-text :nodes="goods.detail" class="rich-content"></rich-text>
    </view>

    <view style="height: 140rpx;"></view>

    <view class="bottom-bar">
      <view class="bottom-icons">
        <view class="bottom-icon" @tap="goHome">
          <view class="b-svg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
          </view>
          <text class="b-label">首页</text>
        </view>
        <view class="bottom-icon" @tap="toggleFavorite">
          <view class="b-svg">
            <svg v-if="!isFavorite" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="#C8102E" stroke="#C8102E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>
          </view>
          <text class="b-label">收藏</text>
        </view>
        <view class="bottom-icon" @tap="goCart">
          <view class="b-svg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          </view>
          <text class="b-label">购物车</text>
        </view>
      </view>
      <view class="bottom-btns">
        <view class="btn-add" @tap="addCart" v-if="goods.stock > 0">
          <text>加入购物车</text>
        </view>
        <view class="btn-buy" @tap="buyNow" v-if="goods.stock > 0">
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
import PriceDisplay from '@/components/PriceDisplay.vue'

const goods = ref<any>({})
const isFavorite = ref(false)
const currentImg = ref(0)

const images = computed(() => {
  if (!goods.value.images) return []
  try { return JSON.parse(goods.value.images) } catch { return [] }
})

const discount = computed(() => {
  if (!goods.value.price || !goods.value.originalPrice || goods.value.originalPrice <= goods.value.price) return null
  return Math.round((1 - Number(goods.value.price) / Number(goods.value.originalPrice)) * 100)
})

const onSwiperChange = (e: any) => { currentImg.value = e.detail.current }

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
  uni.showToast({ title: isFavorite.value ? '已收藏' : '已取消', icon: 'none' })
}

const addCart = () => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/user/login' }), 1000)
    return
  }
  request('/cart', 'POST', { productId: goods.value.id, quantity: 1 })
    .then(() => uni.showToast({ title: '已加入购物车' }))
    .catch(() => uni.showToast({ title: '添加失败', icon: 'none' }))
}

const buyNow = () => {
  uni.navigateTo({ url: `/pages/order/create?productId=${goods.value.id}` })
}
</script>

<style lang="scss" scoped>
.detail {
  min-height: 100vh;
  background-color: #FFFFFF;
}

.detail-gallery {
  position: relative;
}
.gallery-swiper {
  height: 750rpx;
  background-color: #F5F5F5;
}
.gallery-img {
  width: 100%;
  height: 100%;
}
.gallery-counter {
  position: absolute;
  bottom: 24rpx;
  right: 24rpx;
  background: rgba(0,0,0,0.5);
  color: #FFFFFF;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}
.nav-back {
  position: absolute;
  top: 80rpx;
  left: 24rpx;
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  &:active { transform: scale(0.9); }
}
.nav-back-icon {
  font-size: 40rpx;
  color: #1A1A1A;
  font-weight: 300;
  margin-top: -4rpx;
}

.detail-info {
  padding: 32rpx;
}
.info-price-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}
.discount-tag {
  background-color: #C8102E;
  color: #FFFFFF;
  font-size: 22rpx;
  font-weight: 500;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}
.info-name {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #1A1A1A;
  line-height: 1.4;
  margin-bottom: 8rpx;
}
.info-subtitle {
  display: block;
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 24rpx;
}
.info-meta {
  display: flex;
  gap: 32rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #F0F0F0;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  &.out { opacity: 0.4; }
}
.meta-dot {
  font-size: 12rpx;
  color: #C8102E;
}
.meta-text {
  font-size: 22rpx;
  color: #666666;
}

.detail-desc, .detail-content {
  padding: 32rpx;
}
.desc-divider {
  height: 1rpx;
  background-color: #F0F0F0;
  margin-bottom: 32rpx;
}
.desc-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16rpx;
}
.desc-text {
  display: block;
  font-size: 28rpx;
  color: #333333;
  line-height: 1.8;
}
.rich-content {
  font-size: 26rpx;
  color: #333333;
  line-height: 1.8;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 12rpx 24rpx calc(12rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 16rpx;
  z-index: 100;
  box-shadow: 0 -1px 0 rgba(0,0,0,0.06);
}
.bottom-icons {
  display: flex;
  gap: 24rpx;
}
.bottom-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
  &:active { opacity: 0.6; }
}
.b-svg {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48rpx;
}
.b-label {
  font-size: 18rpx;
  color: #999999;
}
.bottom-btns {
  flex: 1;
  display: flex;
  gap: 12rpx;
}
.btn-add, .btn-buy, .btn-soldout {
  flex: 1;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  font-size: 26rpx;
  font-weight: 500;
  &:active { transform: scale(0.96); }
}
.btn-add {
  border: 1rpx solid #1A1A1A;
  color: #1A1A1A;
  background: #FFFFFF;
}
.btn-buy {
  background: #C8102E;
  color: #FFFFFF;
}
.btn-soldout {
  flex: 2;
  background: #F5F5F5;
  color: #999999;
}
</style>
