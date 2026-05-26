<template>
  <view class="empty-state">
    <text class="empty-state__icon">{{ icon }}</text>
    <text class="empty-state__title">{{ title }}</text>
    <text v-if="description" class="empty-state__description">{{ description }}</text>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title?: string
  description?: string
}>(), {
  icon: '📦',
  title: '暂无数据'
})
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 64rpx;

  &__icon {
    font-size: 120rpx;
  }

  &__title {
    font-size: 30rpx;
    font-weight: 500;
    color: var(--text-secondary, #333333);
    margin-top: 24rpx;
  }

  &__description {
    font-size: 26rpx;
    color: var(--text-quaternary, #999999);
    margin-top: 12rpx;
  }
}
</style>
