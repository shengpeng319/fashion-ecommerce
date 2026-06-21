<template>
  <view class="home">
    <!-- Stories 全屏沉浸（保留 Instagram Stories 风格） -->
    <StorySwiper
      v-if="storyProducts.length"
      :products="storyProducts"
      :duration="5000"
      @click="goGoods"
    />

    <!-- 内容流：产品卡片瀑布流 -->
    <view class="feed">
      <!-- 搜索入口 -->
      <view class="feed-search" @tap="goSearch">
        <view class="feed-search__bar">
          <text class="feed-search__icon">🔍</text>
          <text class="feed-search__placeholder">搜索你喜欢的...</text>
        </view>
      </view>

      <!-- Section Header -->
      <view class="section-header">
        <text class="section-header__title">精选好物</text>
        <text class="section-header__more" @tap="goCategory">查看全部</text>
      </view>

      <!-- 加载中骨架 -->
      <view v-if="loading" class="feed-grid">
        <view v-for="i in 4" :key="'sk'+i" class="feed-skeleton">
          <view class="feed-skeleton__img skeleton" />
          <view class="feed-skeleton__line skeleton" style="width: 80%" />
          <view class="feed-skeleton__line skeleton" style="width: 50%" />
        </view>
      </view>

      <!-- 双列瀑布流 -->
      <view v-else-if="feedProducts.length" class="feed-grid">
        <view class="feed-col">
          <ProductCard
            v-for="product in leftCol"
            :key="product.id"
            :product="product"
            @click="goGoods"
          />
        </view>
        <view class="feed-col">
          <ProductCard
            v-for="product in rightCol"
            :key="product.id"
            :product="product"
            @click="goGoods"
          />
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="feed-empty">
        <text class="feed-empty__icon">🛍️</text>
        <text class="feed-empty__text">暂无商品，敬请期待</text>
      </view>

      <!-- 底部安全区 -->
      <view class="feed-bottom" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'
import StorySwiper from '@/components/StorySwiper.vue'
import ProductCard from '@/components/ProductCard.vue'

const storyProducts = ref<any[]>([])
const feedProducts = ref<any[]>([])
const loading = ref(true)

// 双列瀑布流 — 奇数左列，偶数右列
const leftCol = computed(() => feedProducts.value.filter((_, i) => i % 2 === 0))
const rightCol = computed(() => feedProducts.value.filter((_, i) => i % 2 === 1))

onLoad(async () => {
  try {
    const prodRes = await request('/products', 'GET') as Promise<any>
    const all = prodRes?.data || prodRes || []

    // Stories 取前5个
    storyProducts.value = all.slice(0, 5).map((g: any) => ({
      ...g,
      image: g.image || g.thumbnail
    }))

    // 内容流取全部（按销量排序）
    feedProducts.value = all
      .map((g: any) => ({
        ...g,
        thumbnail: g.thumbnail || g.image
      }))
      .sort((a: any, b: any) => (b.sales || 0) - (a.sales || 0))
  } catch (e) {
    console.error('首页加载失败:', e)
  } finally {
    loading.value = false
  }
})

const goGoods = (id: string) => {
  if (!id) return
  uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
}

const goCategory = () => {
  uni.switchTab({ url: '/pages/category/index' })
}

const goSearch = () => {
  uni.navigateTo({ url: '/pages/search/index' })
}
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary, #FAFAF8);
}

/* Stories 保持顶部全屏 */
:deep(.story-swiper) {
  width: 100vw;
  height: 100vh;
}

/* 内容流 */
.feed {
  position: relative;
  z-index: 2;
  margin-top: -60rpx;  /* 略微上浮，覆盖 Stories 底部，自然过渡 */
  background: var(--bg-primary, #FAFAF8);
  border-radius: var(--radius-lg, 32rpx) var(--radius-lg, 32rpx) 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

/* 搜索入口 */
.feed-search {
  padding: var(--space-3, 24rpx) var(--space-4, 32rpx);

  &__bar {
    display: flex;
    align-items: center;
    height: 72rpx;
    background: var(--bg-secondary, #F5F2EE);
    border-radius: var(--radius-full, 9999rpx);
    padding: 0 var(--space-4, 32rpx);
    transition: transform var(--transition-fast);
    &:active { transform: scale(0.98); }
  }

  &__icon {
    font-size: 28rpx;
    margin-right: var(--space-2, 16rpx);
    opacity: 0.5;
  }

  &__placeholder {
    font-size: 26rpx;
    color: var(--text-quaternary, #A8A29E);
  }
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: var(--space-3, 24rpx) var(--space-4, 32rpx) var(--space-2, 16rpx);

  &__title {
    font-size: 36rpx;
    font-weight: var(--fw-medium, 500);
    color: var(--text-primary, #1C1B1A);
    letter-spacing: 1rpx;
  }

  &__more {
    font-size: 24rpx;
    color: var(--text-quaternary, #A8A29E);
    &::after { content: ' >'; }
  }
}

/* 双列瀑布流 */
.feed-grid {
  display: flex;
  gap: var(--space-2, 16rpx);
  padding: 0 var(--space-3, 24rpx);
}

.feed-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 16rpx);
}

/* 骨架屏 */
.feed-skeleton {
  background: var(--bg-card, #FFFFFF);
  border-radius: var(--radius-md, 20rpx);
  overflow: hidden;
  box-shadow: var(--shadow-sm);

  &__img {
    width: 100%;
    padding-bottom: 125%;
  }

  &__line {
    height: 24rpx;
    margin: var(--space-2, 16rpx);
    border-radius: var(--radius-xs, 8rpx);
  }
}

/* 空状态 */
.feed-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8, 64rpx) 0;

  &__icon {
    font-size: 80rpx;
    margin-bottom: var(--space-3, 24rpx);
  }

  &__text {
    font-size: 28rpx;
    color: var(--text-tertiary, #7A7370);
  }
}

.feed-bottom {
  height: 160rpx;  /* 底部 tab bar 高度 */
}
</style>
