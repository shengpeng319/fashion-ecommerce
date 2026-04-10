<template>
  <view class="category-page">
    <!-- Top Tab Navigation -->
    <view class="tab-bar">
      <view 
        v-for="cat in categories" 
        :key="cat.id" 
        class="tab-item" 
        :class="{ active: selectedId === cat.id }"
        @tap="selectCategory(cat)"
      >
        <text class="tab-text">{{ cat.name }}</text>
        <view class="tab-line" v-if="selectedId === cat.id"></view>
      </view>
    </view>

    <!-- Goods Grid -->
    <scroll-view class="goods-scroll" scroll-y @scrolltolower="loadMore">
      <view class="goods-grid" v-if="goodsList.length > 0">
        <view v-for="goods in goodsList" :key="goods.id" 
              class="goods-item" 
              @tap="goGoods(goods.id)">
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
      <view v-else class="empty-state">
        <text class="empty-icon">🛍️</text>
        <text class="empty-text">该分类暂无商品</text>
        <text class="empty-hint">看看其他分类吧~</text>
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

const loadMore = () => {
  // Future pagination support
}

const goGoods = (id: string) => {
  uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
}
</script>

<style lang="scss" scoped>
.category-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

// Top Tab Bar - Taobao style
.tab-bar {
  display: flex;
  background: #fff;
  padding: 0 8rpx;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  
  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28rpx 0;
    position: relative;
    transition: all 0.25s;
    
    .tab-text {
      font-size: 28rpx;
      color: #666;
      font-weight: 500;
      transition: all 0.25s;
    }
    
    .tab-line {
      position: absolute;
      bottom: 0;
      width: 48rpx;
      height: 6rpx;
      background: linear-gradient(135deg, #ff5777, #ff8a9a);
      border-radius: 3rpx;
    }
    
    &.active {
      .tab-text {
        color: #ff5777;
        font-weight: 600;
        font-size: 30rpx;
      }
    }
    
    &:active {
      background: rgba(255, 87, 119, 0.05);
    }
  }
}

// Goods Scroll Area
.goods-scroll {
  flex: 1;
  overflow-y: auto;
  background: #f5f5f5;
}

// Goods Grid - Commercial grade cards
.goods-grid {
  padding: 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.goods-item {
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
    height: 340rpx;
    display: block;
    transition: transform 0.3s;
  }
  
  .goods-tag {
    position: absolute;
    top: 14rpx;
    left: 0;
    background: linear-gradient(135deg, #ff5777, #ff8a9a);
    color: #fff;
    font-size: 20rpx;
    padding: 4rpx 14rpx;
    border-radius: 0 20rpx 20rpx 0;
    box-shadow: 0 4rpx 12rpx rgba(255, 87, 119, 0.3);
  }
}

.goods-info {
  padding: 18rpx;
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
  margin-top: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12rpx;
}

.price-wrap {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}

.price {
  color: #ff5777;
  font-size: 32rpx;
  font-weight: bold;
}

.original {
  color: #ccc;
  font-size: 20rpx;
  text-decoration: line-through;
}

.sales {
  color: #bbb;
  font-size: 20rpx;
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 0;
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 24rpx;
    opacity: 0.8;
  }
  
  .empty-text {
    font-size: 30rpx;
    color: #666;
    font-weight: 500;
  }
  
  .empty-hint {
    font-size: 24rpx;
    color: #999;
    margin-top: 12rpx;
  }
}
</style>
