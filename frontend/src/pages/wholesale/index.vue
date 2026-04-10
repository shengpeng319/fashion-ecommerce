<template>
  <view class="wholesale-page">
    <view class="dealer-info">
      <view class="company">{{ dealer.companyName }}</view>
      <view class="level">批发等级: {{ dealer.level }}</view>
      <view class="credit">信用额度: ¥{{ dealer.creditLine }} | 已用: ¥{{ dealer.usedCredit }}</view>
    </view>
    <view class="search-bar"><input placeholder="搜索批发商品" /></view>
    <view class="goods-grid">
      <view v-for="goods in products" :key="goods.id" class="goods-item">
        <image :src="goods.image" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ goods.name }}</text>
          <text class="price">批发价: ¥{{ goods.dealerPrice }}</text>
          <text class="min-qty">起订: {{ goods.minQty }}{{ goods.unit }}</text>
        </view>
        <button size="mini" @tap="addToCart(goods)">加入订单</button>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
const dealer = ref<any>({ companyName: '经销商', level: 'V1', creditLine: 100000, usedCredit: 0 })
const products = ref<any[]>([])
const addToCart = (goods: any) => { uni.navigateTo({ url: '/pages/wholesale/order' }) }
</script>
<style lang="scss" scoped>
.wholesale-page { min-height: 100vh; background: #f8f8f8; }
.dealer-info { background: linear-gradient(to bottom, #1a1a1a, #333); color: #fff; padding: 32rpx 24rpx; .company { font-size: 36rpx; font-weight: bold; } .level { font-size: 28rpx; margin-top: 8rpx; color: #ffd700; } .credit { font-size: 24rpx; margin-top: 8rpx; color: #ccc; } }
.search-bar { padding: 16rpx 24rpx; background: #fff; input { background: #f5f5f5; border-radius: 32rpx; padding: 16rpx 24rpx; } }
.goods-grid { padding: 16rpx; display: flex; flex-wrap: wrap; gap: 16rpx; .goods-item { width: calc(50% - 8rpx); background: #fff; border-radius: 12rpx; overflow: hidden; padding-bottom: 16rpx; image { width: 100%; height: 300rpx; } .info { padding: 16rpx; .name { font-size: 28rpx; display: block; } .price { color: #ff5777; font-weight: bold; margin-top: 8rpx; } .min-qty { font-size: 24rpx; color: #999; } } button { margin: 0 16rpx; } } }
</style>
