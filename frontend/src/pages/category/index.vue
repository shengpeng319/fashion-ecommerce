<template>
  <view class="mall">
    <view class="mall__sidebar">
      <scroll-view class="mall__sidebar-scroll" scroll-y>
        <view
          class="mall__menu-item"
          :class="{ 'mall__menu-item--active': activeCategoryId === '' }"
          @tap="onCategorySelect('')"
        >
          <view v-if="activeCategoryId === ''" class="mall__menu-indicator" />
          <text class="mall__menu-text">全部商品</text>
        </view>
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="mall__menu-item"
          :class="{ 'mall__menu-item--active': activeCategoryId === cat.id }"
          @tap="onCategorySelect(cat.id)"
        >
          <view v-if="activeCategoryId === cat.id" class="mall__menu-indicator" />
          <text class="mall__menu-text">{{ cat.name }}</text>
        </view>
      </scroll-view>
    </view>

    <view class="mall__main">
      <view class="mall__search">
        <SearchBar v-model="searchKeyword" placeholder="搜索商品" @search="goSearch" />
      </view>

      <view class="mall__sort">
        <view
          v-for="tab in sortTabs"
          :key="tab.key"
          class="mall__sort-tab"
          :class="{ 'mall__sort-tab--active': sortKey === tab.key }"
          @tap="onSort(tab.key)"
        >
          <text class="mall__sort-label">{{ tab.label }}</text>
          <view v-if="tab.key === 'price'" class="mall__sort-arrows">
            <text class="mall__sort-arrow" :class="{ 'mall__sort-arrow--active': sortKey === 'price' && sortOrder === 'asc' }">&#9650;</text>
            <text class="mall__sort-arrow" :class="{ 'mall__sort-arrow--active': sortKey === 'price' && sortOrder === 'desc' }">&#9660;</text>
          </view>
        </view>
      </view>

      <scroll-view
        class="mall__scroll"
        scroll-y
        @scrolltolower="onLoadMore"
      >
        <view v-if="loading" class="mall__loading">
          <SkeletonGrid :count="4" />
        </view>

        <template v-else>
          <view v-if="displayProducts.length > 0" class="mall__grid">
            <ProductCard
              v-for="product in displayProducts"
              :key="product.id"
              :product="product"
              @click="goDetail"
            />
          </view>

          <EmptyState
            v-else
            icon="🔍"
            title="暂无商品"
            description="该分类下暂无商品"
          />
        </template>

        <view v-if="!loading && displayProducts.length > 0 && noMore" class="mall__nomore">
          <text>— 没有更多了 —</text>
        </view>

        <view class="mall__bottom-spacer" />
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'
import SearchBar from '@/components/SearchBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import SkeletonGrid from '@/components/SkeletonGrid.vue'

const categories = ref<any[]>([])
const activeCategoryId = ref('')
const allProducts = ref<any[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const sortKey = ref<'default' | 'price' | 'sales'>('default')
const sortOrder = ref<'asc' | 'desc'>('desc')
const pageSize = 20
const currentPage = ref(1)
const noMore = ref(false)

const sortTabs = [
  { key: 'default', label: '综合' },
  { key: 'price', label: '价格' },
  { key: 'sales', label: '销量' }
]

const filteredProducts = computed(() => {
  let list = allProducts.value
  if (activeCategoryId.value) {
    list = list.filter(p => String(p.categoryId) === String(activeCategoryId.value))
  }
  return list
})

const sortedProducts = computed(() => {
  const list = [...filteredProducts.value]
  if (sortKey.value === 'price') {
    list.sort((a, b) => sortOrder.value === 'asc' ? a.price - b.price : b.price - a.price)
  } else if (sortKey.value === 'sales') {
    list.sort((a, b) => (b.sales || 0) - (a.sales || 0))
  }
  return list
})

const displayProducts = computed(() => {
  return sortedProducts.value.slice(0, currentPage.value * pageSize)
})

const fetchData = async () => {
  loading.value = true
  noMore.value = false
  currentPage.value = 1
  try {
    const [catRes, prodRes]: any[] = await Promise.all([
      request('/categories', 'GET'),
      request('/products', 'GET')
    ])
    categories.value = Array.isArray(catRes) ? catRes : (catRes?.data || [])
    const prods = Array.isArray(prodRes) ? prodRes : (prodRes?.data || [])
    allProducts.value = prods.map((p: any) => ({
      ...p,
      thumbnail: p.thumbnail || p.image
    }))
  } catch (e) {
    allProducts.value = []
  } finally {
    loading.value = false
  }
}

onLoad(async () => {
  await fetchData()
})

const onCategorySelect = (id: string) => {
  activeCategoryId.value = id
  currentPage.value = 1
  noMore.value = false
}

const onSort = (key: string) => {
  if (key === 'price' && sortKey.value === 'price') {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key as any
    sortOrder.value = 'desc'
  }
  currentPage.value = 1
  noMore.value = false
}

const onLoadMore = () => {
  if (loading.value || noMore.value) return
  const total = sortedProducts.value.length
  if (currentPage.value * pageSize >= total) {
    noMore.value = true
    return
  }
  currentPage.value++
}

const goDetail = (id: string | number) => {
  uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
}

const goSearch = (keyword: string) => {
  if (!keyword.trim()) return
  uni.navigateTo({ url: `/pages/search/index?keyword=${encodeURIComponent(keyword)}` })
}
</script>

<style lang="scss" scoped>
.mall {
  display: flex;
  height: 100vh;
  background: #F5F5F5;

  &__sidebar {
    width: 180rpx;
    height: 100%;
    background: #FFFFFF;
    border-right: 1rpx solid #EEEEEE;
    flex-shrink: 0;
  }

  &__sidebar-scroll {
    height: 100%;
  }

  &__menu-item {
    position: relative;
    padding: 36rpx 24rpx;
    text-align: center;
    transition: all 0.2s ease;

    &--active {
      background: #F5F5F5;
    }
  }

  &__menu-indicator {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6rpx;
    height: 36rpx;
    background: #C8102E;
    border-radius: 0 4rpx 4rpx 0;
  }

  &__menu-text {
    font-size: 28rpx;
    color: #333333;
    font-weight: 500;
    letter-spacing: 2rpx;
    line-height: 1.4;
  }

  &__menu-item--active &__menu-text {
    color: #C8102E;
    font-weight: 700;
    letter-spacing: 1rpx;
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__search {
    padding: 16rpx 24rpx;
    background: #FFFFFF;
  }

  &__sort {
    display: flex;
    align-items: center;
    background: #FFFFFF;
    border-bottom: 1rpx solid #EEEEEE;
    padding: 0 24rpx;
  }

  &__sort-tab {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    margin-right: 48rpx;
  }

  &__sort-tab--active &__sort-label {
    color: #1A1A1A;
    font-weight: 600;
  }

  &__sort-label {
    font-size: 26rpx;
    color: #999999;
  }

  &__sort-arrows {
    display: flex;
    flex-direction: column;
    margin-left: 6rpx;
  }

  &__sort-arrow {
    font-size: 14rpx;
    color: #CCCCCC;
    line-height: 1;

    &--active {
      color: #C8102E;
    }
  }

  &__scroll {
    flex: 1;
  }

  &__loading {
    padding: 24rpx;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16rpx;
    padding: 24rpx;
  }

  &__nomore {
    text-align: center;
    padding: 32rpx 0 48rpx;
    font-size: 24rpx;
    color: #BBBBBB;
  }

  &__bottom-spacer {
    height: 120rpx;
  }
}
</style>
