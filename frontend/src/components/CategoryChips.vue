<template>
  <scroll-view class="category-chips" scroll-x :show-scrollbar="false">
    <view class="category-chips__inner">
      <view
        class="category-chips__chip"
        :class="{ 'category-chips__chip--active': activeId === '' }"
        @tap="handleSelect('')"
      >
        全部
      </view>
      <view
        v-for="category in categories"
        :key="category.id"
        class="category-chips__chip"
        :class="{ 'category-chips__chip--active': activeId === category.id }"
        @tap="handleSelect(category.id)"
      >
        {{ category.name }}
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
defineProps<{
  categories: { id: string; name: string }[]
  activeId: string
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const handleSelect = (id: string) => {
  emit('select', id)
}
</script>

<style lang="scss" scoped>
.category-chips {
  width: 100%;
  white-space: nowrap;
  background: var(--bg-primary, #ffffff);

  &__inner {
    display: inline-flex;
    align-items: center;
    padding: var(--space-2, 16rpx) var(--space-4, 32rpx);
    gap: var(--space-2, 16rpx);
  }

  &__chip {
    flex-shrink: 0;
    padding: 12rpx 32rpx;
    border-radius: var(--radius-full, 9999rpx);
    font-size: 26rpx;
    font-weight: 400;
    background: var(--bg-secondary, #f5f5f5);
    color: var(--text-secondary, #333333);
    transition: all 0.2s ease;

    &--active {
      background: var(--accent, #c8102e);
      color: #ffffff;
      font-weight: 500;
    }
  }
}
</style>
