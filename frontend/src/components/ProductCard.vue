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
      <text class="product-card__name">{{ product.name }}</text>
      <view class="product-card__price-row">
        <text class="product-card__price-symbol">¥</text>
        <text class="product-card__price">{{ product.price }}</text>
        <text v-if="hasDiscount" class="product-card__original-price">¥{{ product.originalPrice }}</text>
      </view>
      <text class="product-card__sales">已售 {{ product.sales || 0 }}</text>
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
  background: var(--bg-primary, #ffffff);
  border-radius: var(--radius-sm, 8rpx);
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.15s ease;

  &--active {
    transform: scale(0.98);
  }

  &__image-wrap {
    position: relative;
    width: 100%;
    padding-bottom: 100%;
  }

  &__image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__badge {
    position: absolute;
    top: 0;
    left: 0;
    background: var(--accent, #c8102e);
    color: #ffffff;
    font-size: 22rpx;
    font-weight: 500;
    padding: 4rpx 12rpx;
    border-radius: 0 0 var(--radius-sm, 8rpx) 0;
  }

  &__info {
    padding: var(--space-2, 16rpx);
  }

  &__name {
    display: block;
    font-size: 28rpx;
    font-weight: 500;
    color: var(--text-primary, #1a1a1a);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    margin-top: 8rpx;
  }

  &__price-symbol {
    font-size: 22rpx;
    color: var(--accent, #c8102e);
    font-weight: 500;
  }

  &__price {
    font-size: 36rpx;
    font-weight: 600;
    color: var(--accent, #c8102e);
    line-height: 1;
  }

  &__original-price {
    font-size: 24rpx;
    color: var(--text-quaternary, #999999);
    text-decoration: line-through;
    margin-left: 8rpx;
  }

  &__sales {
    display: block;
    font-size: 22rpx;
    color: var(--text-quaternary, #999999);
    margin-top: 8rpx;
  }
}
</style>
