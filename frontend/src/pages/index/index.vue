<template>
  <view class="home">
    <StorySwiper
      v-if="storyProducts.length"
      :products="storyProducts"
      :duration="5000"
      @click="goGoods"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'
import StorySwiper from '@/components/StorySwiper.vue'

const storyProducts = ref<any[]>([])

onLoad(async () => {
  try {
    const prodRes = await request('/products', 'GET') as Promise<any>
    const all = prodRes?.data || prodRes || []

    storyProducts.value = all.slice(0, 5).map((g: any) => ({
      ...g,
      image: g.image || g.thumbnail
    }))
  } catch (e) {
    console.error('首页加载失败:', e)
  }
})

const goGoods = (id: string) => {
  if (!id) return
  uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
}
</script>

<style lang="scss" scoped>
.home {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
