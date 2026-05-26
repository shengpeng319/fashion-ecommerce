<template>
  <view class="skeleton-grid">
    <view v-for="i in count" :key="i" class="skeleton-grid__card">
      <view class="skeleton-grid__image" />
      <view class="skeleton-grid__line skeleton-grid__line--title" />
      <view class="skeleton-grid__line skeleton-grid__line--price" />
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  count?: number
}>(), {
  count: 4
})
</script>

<style lang="scss" scoped>
.skeleton-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2, 16rpx);
  padding: 0 var(--space-4, 32rpx);

  &__card {
    display: flex;
    flex-direction: column;
  }

  &__image {
    aspect-ratio: 1;
    background: #f0f0f0;
    border-radius: var(--radius-sm, 8rpx);
    animation: shimmer 1.5s infinite;
  }

  &__line {
    height: 24rpx;
    background: #f0f0f0;
    border-radius: 4rpx;
    margin-top: 12rpx;
    animation: shimmer 1.5s infinite;

    &--title {
      width: 70%;
    }

    &--price {
      width: 40%;
    }
  }
}

@keyframes shimmer {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}
</style>
