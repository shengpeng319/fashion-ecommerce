<template>
  <view class="category-page">
    <!-- Category Strip -->
    <view class="cat-strip-wrap">
      <scroll-view scroll-x class="cat-strip" :show-scrollbar="false">
        <view class="cat-items">
          <view v-for="cat in categories" :key="cat.id" class="cat-item"
            :class="{ active: selectedId === cat.id }" @tap="selectCategory(cat)">
            <text class="cat-name">{{ cat.name }}</text>
          </view>
        </view>
      </scroll-view>
      <view class="cat-strip-divider"></view>
    </view>

    <!-- Goods Grid -->
    <scroll-view class="goods-scroll" scroll-y @scrolltolower="loadMore">
      <view class="goods-grid" v-if="goodsList.length > 0">
        <view v-for="goods in goodsList" :key="goods.id" class="goods-card" @tap="goGoods(goods.id)">
          <view class="goods-img-box">
            <image :src="getImage(goods)" mode="aspectFill" class="goods-img" />
            <view class="goods-tag" v-if="goods.originalPrice && goods.originalPrice > goods.price">
              SALE
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

      <view v-else class="empty-state">
        <text class="empty-icon">◇</text>
        <text class="empty-text">该分类暂无商品</text>
        <text class="empty-hint">看看其他分类吧</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

const categories = ref<any[]>([])
const selectedId = ref('')
const goodsList = ref<any[]>([])

const getImage = (goods: any) => {
  try { return JSON.parse(goods.images)[0] } catch { return '' }
}

onLoad(async (opt: any) => {
  try {
    const res: any = await request('/categories', 'GET')
    categories.value = res || []
    if (opt.categoryId) {
      selectedId.value = opt.categoryId
      loadGoods(opt.categoryId)
    } else if (categories.value.length > 0) {
      selectCategory(categories.value[0])
    }
  } catch (e) {
    console.error('load error', e)
  }
})

const selectCategory = async (cat: any) => {
  selectedId.value = cat.id
  await loadGoods(cat.id)
}

const loadGoods = async (categoryId: string) => {
  try {
    const res: any = await request(`/products?categoryId=${categoryId}`, 'GET')
    goodsList.value = res.data || []
  } catch (e) {
    goodsList.value = []
  }
}

const loadMore = () => {}

const goGoods = (id: string) => {
  uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
}
</script>

<style lang="scss" scoped>
.category-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg);
}

// Category Strip
.cat-strip-wrap {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-card);
}
.cat-strip {
  white-space: nowrap;
}
.cat-items {
  display: inline-flex;
  padding: 24rpx 20rpx;
  gap: 12rpx;
}
.cat-item {
  flex-shrink: 0;
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  background: transparent;
  border: 1rpx solid transparent;
  transition: all var(--transition-base);
  .cat-name {
    font-size: 26rpx;
    color: var(--color-text-secondary);
    font-weight: 500;
    letter-spacing: 0.5rpx;
    transition: all var(--transition-base);
  }
  &:active { opacity: 0.7; }
  &.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    .cat-name { color: #fff; font-weight: 600; }
  }
}
.cat-strip-divider {
  height: 1rpx;
  background: var(--color-border-light);
}

// Goods Scroll
.goods-scroll {
  flex: 1;
}

// Goods Grid
.goods-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 24rpx 20rpx;
}
.goods-card {
  width: calc(50% - 10rpx);
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
  font-size: 30rpx;
  font-weight: 700;
  color: var(--color-primary);
}
.goods-original {
  font-family: var(--font-display);
  font-size: 20rpx;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}
.empty-icon {
  font-size: 80rpx;
  color: var(--color-text-muted);
  margin-bottom: 24rpx;
  opacity: 0.4;
}
.empty-text {
  font-size: 28rpx;
  color: var(--color-text-secondary);
  font-weight: 500;
}
.empty-hint {
  font-size: 24rpx;
  color: var(--color-text-muted);
  margin-top: 8rpx;
  font-weight: 300;
}
</style>
