<template>
  <view class="wholesale-order">
    <view class="tips">批发订单需审核后生效</view>
    <view class="goods-list">
      <view v-for="item in items" :key="item.id" class="goods-item">
        <image :src="item.image" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ item.name }}</text>
          <text class="price">¥{{ item.dealerPrice }} x {{ item.quantity }} = ¥{{ item.dealerPrice * item.quantity }}</text>
        </view>
        <view class="stepper">- {{ item.quantity }} +</view>
      </view>
    </view>
    <view class="remark"><input placeholder="订单备注" v-model="remark" /></view>
    <view class="footer">
      <view class="total">合计: <text class="price">¥{{ total }}</text></view>
      <button type="primary" @tap="submit">提交订单</button>
    </view>
  </view>
</template>
<script setup lang="ts">
const items = ref<any[]>([])
const remark = ref('')
const total = computed(() => items.value.reduce((sum, i) => sum + i.dealerPrice * i.quantity, 0))
const submit = () => { uni.showToast({ title: '订单已提交' }); uni.navigateBack() }
</script>
<style lang="scss" scoped>
.wholesale-order { min-height: 100vh; padding-bottom: 120rpx; background: #f8f8f8; }
.tips { background: #fff7e6; color: #f60; padding: 16rpx 24rpx; font-size: 26rpx; }
.goods-list { background: #fff; margin-top: 16rpx; .goods-item { display: flex; align-items: center; padding: 24rpx; border-bottom: 1rpx solid #f5f5f5; image { width: 120rpx; height: 120rpx; border-radius: 8rpx; margin-right: 16rpx; } .info { flex: 1; .name { font-size: 28rpx; display: block; } .price { color: #ff5777; font-size: 26rpx; } } } }
.remark { background: #fff; padding: 24rpx; margin-top: 16rpx; input { background: #f5f5f5; padding: 16rpx; border-radius: 8rpx; width: 100%; } }
.footer { position: fixed; bottom: 0; left: 0; right: 0; height: 100rpx; background: #fff; border-top: 1rpx solid #e5e5e5; display: flex; justify-content: space-between; align-items: center; padding: 0 24rpx; .price { color: #ff5777; font-weight: bold; font-size: 36rpx; } }
</style>
