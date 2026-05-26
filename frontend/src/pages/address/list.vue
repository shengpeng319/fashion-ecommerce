<template>
  <view class="addr-page">
    <view class="addr-list" v-if="addresses.length > 0">
      <view v-for="item in addresses" :key="item.id" class="addr-card" @tap="selectAddress(item)">
        <view class="addr-header">
          <text class="addr-name">{{ item.name }}</text>
          <text class="addr-phone">{{ item.phone }}</text>
          <text class="addr-default" v-if="item.isDefault">默认</text>
        </view>
        <text class="addr-body">{{ item.province }} {{ item.city }} {{ item.district }} {{ item.detail }}</text>
        <view class="addr-actions" @tap.stop>
          <text class="addr-action" @tap="editAddress(item)">编辑</text>
          <text class="addr-action danger" @tap="deleteAddress(item.id)">删除</text>
        </view>
      </view>
    </view>

    <view class="empty" v-else>
      <text class="empty-icon">▣</text>
      <text class="empty-title">暂无地址</text>
      <text class="empty-sub">添加收货地址以便下单</text>
    </view>

    <view class="add-bar">
      <view class="add-btn" @tap="addAddress">
        <text>+ 添加新地址</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'; import { onShow } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

const addresses = ref<any[]>([])
const mode = ref<'select' | 'manage'>('manage')

onShow(() => {
  const pages = getCurrentPages()
  mode.value = (pages[pages.length - 1].options?.mode as any) || 'manage'
  loadAddresses()
})

const loadAddresses = async () => {
  try { addresses.value = await request('/addresses', 'GET') } catch (e) {}
}

const selectAddress = (item: any) => {
  if (mode.value === 'select') {
    uni.setStorageSync('selectedAddress', item)
    uni.navigateBack()
  }
}

const addAddress = () => uni.navigateTo({ url: '/pages/address/form' })
const editAddress = (item: any) => uni.navigateTo({ url: `/pages/address/form?id=${item.id}` })

const deleteAddress = async (id: string) => {
  uni.showModal({ title: '删除', content: '确定删除该地址？', success: async (res) => {
    if (res.confirm) {
      try { await request(`/addresses/${id}`, 'DELETE'); loadAddresses() } catch (e) {}
    }
  }})
}
</script>

<style lang="scss" scoped>
.addr-page { min-height: 100vh; background: var(--color-bg); padding: 24rpx 24rpx 140rpx; }

.addr-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 28rpx;
  margin-bottom: 16rpx;
  box-shadow: var(--shadow-sm);
}
.addr-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}
.addr-name {
  font-family: var(--font-display);
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text);
}
.addr-phone { font-size: 26rpx; color: var(--color-text-secondary); }
.addr-default {
  font-size: 18rpx;
  color: var(--color-gold);
  font-weight: 600;
  letter-spacing: 2rpx;
  border: 1rpx solid var(--color-gold);
  padding: 2rpx 12rpx;
  border-radius: var(--radius-sm);
}
.addr-body { font-size: 26rpx; color: var(--color-text-muted); line-height: 1.5; display: block; }
.addr-actions {
  display: flex;
  gap: 32rpx;
  padding-top: 20rpx;
  margin-top: 16rpx;
  border-top: 1rpx solid var(--color-divider);
}
.addr-action { font-size: 24rpx; color: var(--color-text-secondary); }
.addr-action.danger { color: var(--color-error); }

.empty { text-align: center; padding: 200rpx 0; }
.empty-icon { font-size: 64rpx; color: var(--color-text-muted); opacity: 0.4; }
.empty-title { display: block; font-size: 28rpx; color: var(--color-text-secondary); margin-top: 24rpx; }
.empty-sub { display: block; font-size: 24rpx; color: var(--color-text-muted); margin-top: 8rpx; }

.add-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  padding: 20rpx 24rpx;
  background: var(--color-card);
  border-top: 1rpx solid var(--color-border-light);
}
.add-btn {
  height: 88rpx;
  background: var(--color-primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  &:active { opacity: 0.85; }
  text { font-size: 28rpx; font-weight: 600; color: #fff; letter-spacing: 2rpx; }
}
</style>
