<template>
  <view class="address-page">
    <view class="address-list" v-if="addresses.length > 0">
      <view v-for="item in addresses" :key="item.id" class="address-item">
        <view class="address-info" @tap="selectAddress(item)">
          <view class="name-row">
            <text class="name">{{ item.name }}</text>
            <text class="phone">{{ item.phone }}</text>
            <view class="default-tag" v-if="item.isDefault">默认</view>
          </view>
          <text class="detail">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}</text>
        </view>
        <view class="address-actions">
          <view class="action-edit" @tap="editAddress(item)">
            <text>编辑</text>
          </view>
          <view class="action-delete" @tap="deleteAddress(item.id)">
            <text>删除</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="empty-state" v-else>
      <text class="empty-icon">📍</text>
      <text class="empty-title">暂无收货地址</text>
      <text class="empty-sub">添加收货地址以便下单</text>
    </view>
    
    <view class="add-btn-wrap">
      <button class="add-btn" @tap="addAddress">+ 添加新地址</button>
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
  const currentPage = pages[pages.length - 1]
  mode.value = currentPage.options?.mode as any || 'manage'
  loadAddresses()
})

const loadAddresses = async () => {
  try {
    addresses.value = await request('/addresses', 'GET')
  } catch (e) {
    console.error('load addresses error', e)
  }
}

const selectAddress = (item: any) => {
  if (mode.value === 'select') {
    uni.setStorageSync('selectedAddress', item)
    uni.navigateBack()
  }
}

const addAddress = () => {
  uni.navigateTo({ url: '/pages/address/form' })
}

const editAddress = (item: any) => {
  uni.navigateTo({ url: `/pages/address/form?id=${item.id}` })
}

const deleteAddress = async (id: string) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个地址吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request(`/addresses/${id}`, 'DELETE')
          uni.showToast({ title: '已删除', icon: 'none' })
          loadAddresses()
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}
</script>
<style lang="scss" scoped>
.address-page { min-height: 100vh; background: #f5f5f5; padding: 16rpx 24rpx 140rpx; }

.address-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 16rpx;
}
.address-info { border-bottom: 1rpx solid #f5f5f5; padding-bottom: 20rpx; }
.name-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  .name { font-size: 32rpx; font-weight: bold; }
  .phone { font-size: 28rpx; color: #666; }
  .default-tag {
    background: #ff5777;
    color: #fff;
    font-size: 20rpx;
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
  }
}
.detail { font-size: 26rpx; color: #999; margin-top: 8rpx; display: block; }

.address-actions {
  display: flex;
  justify-content: flex-end;
  gap: 32rpx;
  padding-top: 20rpx;
  view { font-size: 26rpx; color: #666; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  .empty-icon { font-size: 100rpx; }
  .empty-title { font-size: 32rpx; color: #333; font-weight: 600; margin-top: 24rpx; }
  .empty-sub { font-size: 26rpx; color: #999; margin-top: 12rpx; }
}

.add-btn-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 24rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}
.add-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ff5777, #ff8a9a);
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
