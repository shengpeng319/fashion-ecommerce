<template>
  <view class="category-page">
    <view class="category-page__chips">
      <CategoryChips
        :categories="categories"
        :activeId="activeCategoryId"
        @select="onCategorySelect"
      />
    </view>

    <view class="category-page__sort">
      <view
        v-for="tab in sortTabs"
        :key="tab.key"
        class="category-page__sort-tab"
        :class="{ 'category-page__sort-tab--active': sortKey === tab.key }"
        @tap="onSort(tab.key)"
      >
        <text class="category-page__sort-label">{{ tab.label }}</text>
        <view v-if="tab.key === 'price'" class="category-page__sort-arrows">
          <text class="category-page__sort-arrow" :class="{ 'category-page__sort-arrow--active': sortKey === 'price' && sortOrder === 'asc' }">&#9650;</text>
          <text class="category-page__sort-arrow" :class="{ 'category-page__sort-arrow--active': sortKey === 'price' && sortOrder === 'desc' }">&#9660;</text>
        </view>
      </view>
    </view>

    <scroll-view
      class="category-page__scroll"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <SkeletonGrid v-if="loading" :count="4" />

      <template v-else>
        <view v-if="displayProducts.length > 0" class="category-page__grid">
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
          description="该分类下暂无商品，换个分类看看"
        />
      </template>

      <view v-if="!loading && displayProducts.length > 0 && noMore" class="category-page__nomore">
        <text>— 没有更多了 —</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'
import CategoryChips from '@/components/CategoryChips.vue'
import ProductCard from '@/components/ProductCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import SkeletonGrid from '@/components/SkeletonGrid.vue'

const categories = ref<any[]>([])
const activeCategoryId = ref('')
const allProducts = ref<any[]>([])
const loading = ref(false)
const refreshing = ref(false)
const sortKey = ref<'default' | 'price' | 'sales'>('default')
const sortOrder = ref<'asc' | 'desc'>('desc')
const pageSize = 20
const currentPage = ref(1)
const noMore = ref(false)

const sortTabs = [
  { key: 'default', label: '综合排序' },
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
    sortOrder.value = key === 'sales' ? 'desc' : 'desc'
  }
  currentPage.value = 1
  noMore.value = false
}

const onRefresh = async () => {
  refreshing.value = true
  await fetchData()
  refreshing.value = false
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
</script>

<style lang="scss" scoped>
.category-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-secondary);

  &__chips {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--bg-primary);
  }

  &__sort {
    display: flex;
    align-items: center;
    background: var(--bg-primary);
    border-bottom: 1rpx solid var(--border);
    padding: 0 var(--space-4);
  }

  &__sort-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-3) 0;
    margin-right: var(--space-6);
    position: relative;

    &--active {
      .category-page__sort-label {
        color: var(--text-primary);
        font-weight: 600;
      }
    }
  }

  &__sort-label {
    font-size: 26rpx;
    color: var(--text-tertiary);
    font-weight: 400;
  }

  &__sort-arrows {
    display: flex;
    flex-direction: column;
    margin-left: 6rpx;
    line-height: 1;
  }

  &__sort-arrow {
    font-size: 14rpx;
    color: var(--text-quaternary);
    line-height: 1;

    &--active {
      color: var(--accent);
    }
  }

  &__scroll {
    flex: 1;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
  }

  &__nomore {
    text-align: center;
    padding: var(--space-6) 0 var(--space-8);
    font-size: 24rpx;
    color: var(--text-quaternary);
  }
}
</style>
