<template>
  <view class="addr-page">
    <view class="addr-list" v-if="addresses.length > 0">
      <view v-for="item in addresses" :key="item.id" class="addr-card" @tap="selectAddress(item)">
        <view class="addr-header">
          <text class="addr-name">{{ item.name }}</text>
          <text class="addr-phone">{{ item.phone }}</text>
          <view class="addr-default" v-if="item.isDefault">
            <text>默认</text>
          </view>
        </view>
        <text class="addr-body">{{ item.province }} {{ item.city }} {{ item.district }} {{ item.detail }}</text>
        <view class="addr-actions" @tap.stop>
          <view class="addr-action" @tap="editAddress(item)">
            <text>编辑</text>
          </view>
          <view class="addr-action action-danger" @tap="deleteAddress(item.id)">
            <text>删除</text>
          </view>
        </view>
      </view>
    </view>

    <view class="empty" v-else>
      <text class="empty-icon">📍</text>
      <text class="empty-title">暂无地址</text>
      <text class="empty-sub">添加收货地址以便下单</text>
    </view>

    <view class="add-bar">
      <view class="add-btn" @tap="addAddress">
        <text>+ 新增收货地址</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
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
  uni.showModal({
    title: '删除',
    content: '确定删除该地址？',
    success: async (res) => {
      if (res.confirm) {
        try { await request(`/addresses/${id}`, 'DELETE'); loadAddresses() } catch (e) {}
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.addr-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 20rpx 24rpx 140rpx;
}

.addr-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 16rpx;
}

.addr-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.addr-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.addr-phone {
  font-size: 26rpx;
  color: #666666;
}

.addr-default {
  background: #FFF0F0;
  padding: 2rpx 12rpx;
  border-radius: 8rpx;

  text {
    font-size: 18rpx;
    color: #C8102E;
    font-weight: 600;
  }
}

.addr-body {
  font-size: 26rpx;
  color: #999999;
  line-height: 1.5;
  display: block;
}

.addr-actions {
  display: flex;
  gap: 24rpx;
  padding-top: 20rpx;
  margin-top: 16rpx;
  border-top: 1rpx solid #F0F0F0;
}

.addr-action {
  padding: 8rpx 24rpx;
  background: #F5F5F5;
  border-radius: 8rpx;

  text {
    font-size: 24rpx;
    color: #666666;
  }

  &:active {
    opacity: 0.7;
  }
}

.action-danger {
  text {
    color: #C8102E;
  }
}

.empty {
  text-align: center;
  padding: 200rpx 0;
}

.empty-icon {
  font-size: 64rpx;
}

.empty-title {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-top: 24rpx;
}

.empty-sub {
  display: block;
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

.add-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 24rpx;
  background: #FFFFFF;
  border-top: 1rpx solid #EEEEEE;
}

.add-btn {
  height: 88rpx;
  background: #C8102E;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.85;
  }

  text {
    font-size: 28rpx;
    font-weight: 600;
    color: #FFFFFF;
  }
}
</style>
