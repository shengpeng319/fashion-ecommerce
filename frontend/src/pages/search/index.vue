<template>
  <view class="search-page">
    <view class="search-page__bar">
      <SearchBar
        v-model="keyword"
        placeholder="搜索商品"
        @search="doSearch"
      />
    </view>

    <view v-if="!hasSearched" class="search-page__hint">
      <text class="search-page__hint-text">输入关键词搜索商品</text>
    </view>

    <template v-else>
      <view class="search-page__sort">
        <view
          v-for="tab in sortTabs"
          :key="tab.key"
          class="search-page__sort-tab"
          :class="{ 'search-page__sort-tab--active': sortKey === tab.key }"
          @tap="onSort(tab.key)"
        >
          <text class="search-page__sort-label">{{ tab.label }}</text>
          <view v-if="tab.key === 'price'" class="search-page__sort-arrows">
            <text class="search-page__sort-arrow" :class="{ 'search-page__sort-arrow--active': sortKey === 'price' && sortOrder === 'asc' }">&#9650;</text>
            <text class="search-page__sort-arrow" :class="{ 'search-page__sort-arrow--active': sortKey === 'price' && sortOrder === 'desc' }">&#9660;</text>
          </view>
        </view>
      </view>

      <scroll-view class="search-page__scroll" scroll-y @scrolltolower="onLoadMore">
        <SkeletonGrid v-if="loading" :count="4" />

        <template v-else>
          <view v-if="results.length > 0" class="search-page__grid">
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
            title="未找到相关商品"
            description="换个关键词试试"
          />
        </template>

        <view v-if="!loading && results.length > 0 && noMore" class="search-page__nomore">
          <text>— 没有更多了 —</text>
        </view>
      </scroll-view>
    </template>
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

const keyword = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const hasSearched = ref(false)
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

const sortedProducts = computed(() => {
  const list = [...results.value]
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

onLoad((opt: any) => {
  if (opt?.keyword) {
    keyword.value = decodeURIComponent(opt.keyword)
    doSearch()
  }
})

const doSearch = async (kw?: string) => {
  const q = (kw || keyword.value || '').trim()
  if (!q) return
  keyword.value = q
  loading.value = true
  hasSearched.value = true
  noMore.value = false
  currentPage.value = 1
  try {
    const res: any = await request(`/products?keyword=${encodeURIComponent(q)}`, 'GET')
    const prods = Array.isArray(res) ? res : (res?.data || [])
    results.value = prods.map((p: any) => ({
      ...p,
      thumbnail: p.thumbnail || p.image
    }))
    if (prods.length <= pageSize) noMore.value = true
  } catch {
    results.value = []
  } finally {
    loading.value = false
  }
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

const onLoadMore = () => {
  if (loading.value || noMore.value) return
  if (currentPage.value * pageSize >= results.value.length) {
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
.search-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-secondary);

  &__bar {
    background: var(--bg-primary);
    padding: 16rpx 32rpx;
  }

  &__hint {
    display: flex;
    justify-content: center;
    padding-top: 200rpx;
  }

  &__hint-text {
    font-size: 28rpx;
    color: var(--text-quaternary);
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

    &--active {
      .search-page__sort-label {
        color: var(--text-primary);
        font-weight: 600;
      }
    }
  }

  &__sort-label {
    font-size: 26rpx;
    color: var(--text-tertiary);
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
