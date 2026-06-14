<template>
  <view class="home">
    <view class="home-header">
      <SearchBar v-model="searchKeyword" placeholder="搜索商品" @search="goSearch" />
    </view>

    <BannerSwiper v-if="banners.length" :banners="banners" @click="goGoods" />

    <CategoryChips
      v-if="categories.length"
      :categories="categories"
      :active-id="activeCat"
      @select="goCategory"
    />

    <view class="home-section">
      <view class="section-header">
        <text class="section-header__title">新品上市</text>
        <text class="section-header__more" @tap="goCategory('')">查看全部 ></text>
      </view>
      <view v-if="loading" class="goods-grid">
        <SkeletonGrid :count="4" />
      </view>
      <view v-else-if="newArrivals.length" class="goods-grid">
        <ProductCard
          v-for="item in newArrivals"
          :key="item.id"
          :product="item"
          @click="goGoods(item.id)"
        />
      </view>
      <EmptyState v-else icon="👗" title="暂无新品" description="敬请期待" />
    </view>

    <view v-if="recommended.length" class="home-section">
      <view class="section-header">
        <text class="section-header__title">为你推荐</text>
        <text class="section-header__more" @tap="goCategory('')">查看全部 ></text>
      </view>
      <view class="goods-grid">
        <ProductCard
          v-for="item in recommended"
          :key="item.id"
          :product="item"
          @click="goGoods(item.id)"
        />
      </view>
    </view>

    <view class="home-footer">
      <text class="home-footer__brand">FASHION</text>
      <text class="home-footer__tagline">品质生活 从穿搭开始</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'
import SearchBar from '@/components/SearchBar.vue'
import BannerSwiper from '@/components/BannerSwiper.vue'
import CategoryChips from '@/components/CategoryChips.vue'
import ProductCard from '@/components/ProductCard.vue'
import SkeletonGrid from '@/components/SkeletonGrid.vue'
import EmptyState from '@/components/EmptyState.vue'

const banners = ref<any[]>([])
const categories = ref<any[]>([])
const searchKeyword = ref('')
const newArrivals = ref<any[]>([])
const recommended = ref<any[]>([])
const activeCat = ref('')
const loading = ref(true)

onLoad(async () => {
  try {
    const [prodRes, catRes] = await Promise.all([
      request('/products', 'GET') as Promise<any>,
      request('/categories', 'GET') as Promise<any>
    ])

    const all = prodRes?.data || prodRes || []
    categories.value = (catRes?.data || catRes || []).slice(0, 8)

    banners.value = all.slice(0, 3).map((g: any) => {
      let img = ''
      try { img = JSON.parse(g.images)[0] } catch { img = g.image || '' }
      return { id: g.id, image: img, title: g.name, subtitle: g.subtitle }
    })

    newArrivals.value = all.slice(0, 6)
    recommended.value = all.length > 6 ? all.slice(6) : [...all].reverse().slice(0, 6)
  } catch (e) {
    console.error('首页加载失败:', e)
  } finally {
    loading.value = false
  }
})

const goCategory = (id: string) => {
  uni.switchTab({ url: '/pages/category/index' })
}

const goGoods = (id: string) => {
  if (!id) return
  uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
}

const goSearch = (keyword: string) => {
  if (!keyword.trim()) return
  uni.navigateTo({ url: `/pages/search/index?keyword=${encodeURIComponent(keyword)}` })
}
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  background-color: var(--bg-secondary, #F5F5F5);
  padding-bottom: env(safe-area-inset-bottom);
}

.home-header {
  background-color: #FFFFFF;
  padding: 16rpx 32rpx 24rpx;
}

.home-section {
  margin-top: 16rpx;
  background-color: #FFFFFF;
  padding-bottom: 16rpx;
}

.goods-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  padding: 0 32rpx;
}

.home-footer {
  padding: 80rpx 40rpx 120rpx;
  text-align: center;
  background-color: #FFFFFF;
  margin-top: 16rpx;

  &__brand {
    display: block;
    font-size: 36rpx;
    font-weight: 700;
    color: var(--text-primary, #1A1A1A);
    letter-spacing: 8rpx;
    margin-bottom: 12rpx;
  }

  &__tagline {
    display: block;
    font-size: 24rpx;
    color: var(--text-quaternary, #999999);
    letter-spacing: 2rpx;
  }
}
</style>
