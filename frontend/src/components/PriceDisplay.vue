<template>
  <view class="price-display">
    <text class="price-display__symbol" :class="sizeClass">¥</text>
    <text class="price-display__value" :class="sizeClass">{{ price }}</text>
    <text
      v-if="originalPrice && originalPrice > price"
      class="price-display__original"
    >
      ¥{{ originalPrice }}
    </text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  price: number
  originalPrice?: number
  size?: 'normal' | 'large'
}>(), {
  size: 'normal'
})

const sizeClass = computed(() => `price-display--${props.size}`)
</script>

<style lang="scss" scoped>
.price-display {
  display: flex;
  align-items: baseline;

  &__symbol {
    color: var(--accent, #c8102e);
    font-weight: 500;

    &.price-display--normal {
      font-size: 24rpx;
    }

    &.price-display--large {
      font-size: 28rpx;
    }
  }

  &__value {
    color: var(--accent, #c8102e);
    font-weight: 600;

    &.price-display--normal {
      font-size: 36rpx;
    }

    &.price-display--large {
      font-size: 44rpx;
    }
  }

  &__original {
    font-size: 24rpx;
    color: var(--text-quaternary, #999999);
    text-decoration: line-through;
    margin-left: 8rpx;
  }
}
</style>
