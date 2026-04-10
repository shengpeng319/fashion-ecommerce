<template>
  <view class="index-page">
    <!-- Search Bar -->
    <view class="search-bar">
      <view class="search-inner">
        <text class="search-icon">🔍</text>
        <input placeholder="搜索时尚单品" v-model="keyword" @confirm="search" />
      </view>
    </view>

    <!-- Banner -->
    <swiper class="banner" indicator-dots autoplay circular indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#ff5777">
      <swiper-item v-for="item in banners" :key="item.id">
        <image :src="item.image" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <!-- Categories -->
    <view class="categories">
      <view v-for="(cat, idx) in categories" :key="cat.id" class="cat-item" @tap="goCategory(cat.id)">
        <view class="cat-icon">{{ categoryIcons[idx] || '👗' }}</view>
        <text class="cat-name">{{ cat.name }}</text>
      </view>
    </view>

    <!-- Hot Products -->
    <view class="section">
      <view class="section-header">
        <view class="section-title">
          <text class="title-text">热门推荐</text>
          <text class="title-sub">HOT</text>
        </view>
        <view class="more" @tap="goCategory('')">
          <text>查看更多</text>
          <text class="arrow">›</text>
        </view>
      </view>
      <view class="goods-grid">
        <view v-for="goods in hotGoods" :key="goods.id" class="goods-card" @tap="goGoods(goods.id)">
          <view class="goods-img-wrap">
            <image :src="JSON.parse(goods.images)[0]" mode="aspectFill" class="goods-img" />
            <view class="goods-tag" v-if="goods.originalPrice">特惠</view>
          </view>
          <view class="goods-info">
            <text class="goods-name">{{ goods.name }}</text>
            <text class="goods-sub">{{ goods.subtitle }}</text>
            <view class="goods-bottom">
              <view class="price-wrap">
                <text class="price">¥{{ goods.price }}</text>
                <text class="original" v-if="goods.originalPrice">¥{{ goods.originalPrice }}</text>
              </view>
              <text class="sales">已售{{ goods.sales }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

const categoryIcons = ['👚', '👖', '👗', '🧥', '👠', '👜', '🎒', '💍']

const keyword = ref('')
const banners = ref<any[]>([
  { id: 1, image: 'https://img.yzcdn.cn/vant/apple-1.jpg' },
  { id: 2, image: 'https://img.yzcdn.cn/vant/apple-2.jpg' }
])
const categories = ref<any[]>([])
const hotGoods = ref<any[]>([])

onLoad(async () => {
  try {
    const res: any = await request('/products', 'GET')
    hotGoods.value = res.data || []
    const catRes: any = await request('/categories', 'GET')
    categories.value = catRes || []
  } catch (e) {
    console.error('load error', e)
  }
})

const search = () => {
  if (keyword.value) {
    uni.navigateTo({ url: `/pages/goods/detail?keyword=${keyword.value}` })
  }
}

const goCategory = (id: string) => {
  uni.switchTab({ url: `/pages/category/index?categoryId=${id}` })
}

const goGoods = (id: string) => {
  uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
}
</script>

<style lang="scss" scoped>
.index-page { min-height: 100vh; background: #f5f5f5; }

// Search Bar
.search-bar {
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, #ff5777, #ff8a9a);
  position: sticky;
  top: 0;
  z-index: 100;
}
.search-inner {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.98);
  border-radius: 40rpx;
  padding: 0 28rpx;
  height: 72rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 87, 119, 0.2);
}
.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}
.search-inner input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

// Banner
.banner {
  height: 320rpx;
  margin-bottom: 0;
  image { width: 100%; height: 100%; }
}

// Categories - Clean 2-row grid with smaller icons
.categories {
  display: flex;
  flex-wrap: wrap;
  padding: 24rpx 20rpx 20rpx;
  background: #fff;
  margin-bottom: 16rpx;
  .cat-item {
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20rpx;
    .cat-icon {
      width: 100rpx;
      height: 100rpx;
      background: linear-gradient(145deg, #fff5f7 0%, #fff 100%);
      border-radius: 24rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 56rpx;
      margin-bottom: 10rpx;
      box-shadow: 0 4rpx 16rpx rgba(255, 87, 119, 0.1);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    &:active .cat-icon {
      transform: scale(0.88);
      box-shadow: 0 2rpx 8rpx rgba(255, 87, 119, 0.08);
    }
    .cat-name {
      font-size: 24rpx;
      color: #555;
      font-weight: 500;
    }
  }
}

// Section
.section {
  background: #fff;
  padding-bottom: 24rpx;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx 20rpx;
}
.section-title {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  .title-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
  .title-sub {
    font-size: 20rpx;
    color: #ff5777;
    font-weight: bold;
    letter-spacing: 2rpx;
  }
}
.more {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
  .arrow { font-size: 28rpx; margin-left: 4rpx; }
}

// Goods Grid - Commercial grade card design
.goods-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 0 20rpx;
}
.goods-card {
  width: calc(50% - 10rpx);
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:active {
    transform: translateY(4rpx) scale(0.98);
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  }
}
.goods-img-wrap {
  position: relative;
  overflow: hidden;
  .goods-img {
    width: 100%;
    height: 360rpx;
    display: block;
    transition: transform 0.3s;
  }
  .goods-tag {
    position: absolute;
    top: 16rpx;
    left: 0;
    background: linear-gradient(135deg, #ff5777, #ff8a9a);
    color: #fff;
    font-size: 22rpx;
    padding: 6rpx 16rpx;
    border-radius: 0 24rpx 24rpx 0;
    box-shadow: 0 4rpx 12rpx rgba(255, 87, 119, 0.3);
  }
}
.goods-info {
  padding: 20rpx;
}
.goods-name {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}
.goods-sub {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14rpx;
}
.price-wrap {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}
.price {
  color: #ff5777;
  font-size: 34rpx;
  font-weight: bold;
}
.original {
  color: #ccc;
  font-size: 22rpx;
  text-decoration: line-through;
}
.sales {
  color: #bbb;
  font-size: 20rpx;
}
</style>
