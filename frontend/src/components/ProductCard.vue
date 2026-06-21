<template>
  <view class="product-card" :hover-class="'product-card--active'" @tap="handleClick">
    <view class="product-card__image-wrap">
      <image
        class="product-card__image"
        :src="product.thumbnail || product.image"
        mode="aspectFill"
        lazy-load
      />
      <view v-if="hasDiscount" class="product-card__badge">
        -{{ discountPercent }}%
      </view>
    </view>
    <view class="product-card__info">
      <text class="product-card__name line-clamp-2">{{ product.name }}</text>
      <view class="product-card__price-row">
        <text class="product-card__price-symbol">¥</text>
        <text class="product-card__price">{{ product.price }}</text>
        <text v-if="hasDiscount" class="product-card__original-price">¥{{ product.originalPrice }}</text>
      </view>
      <text v-if="product.sales" class="product-card__sales">已售 {{ product.sales }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  product: {
    id: string | number
    name: string
    price: number
    originalPrice?: number
    image: string
    thumbnail?: string
    sales?: number
  }
}>()

const emit = defineEmits<{
  click: [id: string | number]
}>()

const hasDiscount = computed(() => {
  return props.product.originalPrice && props.product.originalPrice > props.product.price
})

const discountPercent = computed(() => {
  if (!hasDiscount.value) return 0
  return Math.round((1 - props.product.price / props.product.originalPrice!) * 100)
})

const handleClick = () => {
  emit('click', props.product.id)
}
</script>

<style lang="scss" scoped>
.product-card {
  background: var(--bg-card, #ffffff);
  border-radius: var(--radius-md, 20rpx);
  overflow: hidden;
  box-shadow: var(--shadow-sm, 0 2rpx 8rpx rgba(28,27,26,0.04), 0 1rpx 2rpx rgba(28,27,26,0.02));
  transition: transform var(--transition-fast, 200ms cubic-bezier(0.16,1,0.3,1));

  // Ins-style elastic press
  &--active {
    transform: scale(0.97);
  }

  // 4:5 Instagram portrait ratio
  &__image-wrap {
    position: relative;
    width: 100%;
    padding-bottom: 125%;  // 4:5 aspect ratio
  }

  &__image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  // Pill-shaped badge
  &__badge {
    position: absolute;
    top: var(--space-1, 8rpx);
    left: var(--space-1, 8rpx);
    background: var(--accent, #B85C38);
    color: #ffffff;
    font-size: 20rpx;
    font-weight: var(--fw-medium, 500);
    padding: 4rpx 16rpx;
    border-radius: var(--radius-full, 9999rpx);
  }

  &__info {
    padding: var(--space-2, 16rpx) var(--space-2, 16rpx) var(--space-3, 24rpx);
  }

  // Lighter font weight, 2-line clamp
  &__name {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 26rpx;
    font-weight: var(--fw-regular, 400);
    line-height: 1.5;
    color: var(--text-primary, #1C1B1A);
    min-height: 78rpx;  // 2 lines stable height
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    margin-top: var(--space-1, 8rpx);
  }

  &__price-symbol {
    font-size: 22rpx;
    color: var(--accent, #B85C38);
    font-weight: var(--fw-medium, 500);
  }

  &__price {
    font-size: 40rpx;
    font-weight: var(--fw-semibold, 600);
    color: var(--accent, #B85C38);
    line-height: 1;
    font-family: var(--font-display, 'Inter', sans-serif);
  }

  &__original-price {
    font-size: 22rpx;
    color: var(--text-quaternary, #A8A29E);
    text-decoration: line-through;
    margin-left: var(--space-1, 8rpx);
  }

  &__sales {
    display: block;
    font-size: 20rpx;
    color: var(--text-quaternary, #A8A29E);
    margin-top: var(--space-1, 8rpx);
  }
}
</style>
