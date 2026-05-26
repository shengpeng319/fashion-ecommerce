<template>
  <swiper
    class="banner-swiper"
    :autoplay="true"
    :interval="4000"
    :circular="true"
    :indicator-dots="true"
    indicator-active-color="var(--accent, #c8102e)"
    indicator-color="rgba(255, 255, 255, 0.5)"
  >
    <swiper-item v-for="banner in banners" :key="banner.id" @tap="handleClick(banner)">
      <view class="banner-swiper__item">
        <image class="banner-swiper__image" :src="banner.image" mode="aspectFill" />
        <view class="banner-swiper__overlay">
          <view v-if="banner.title" class="banner-swiper__text">
            <text class="banner-swiper__title">{{ banner.title }}</text>
            <text v-if="banner.subtitle" class="banner-swiper__subtitle">{{ banner.subtitle }}</text>
          </view>
        </view>
      </view>
    </swiper-item>
  </swiper>
</template>

<script setup lang="ts">
defineProps<{
  banners: {
    id: string | number
    image: string
    title?: string
    subtitle?: string
    link?: string
  }[]
}>()

const emit = defineEmits<{
  click: [banner: any]
}>()

const handleClick = (banner: any) => {
  emit('click', banner)
}
</script>

<style lang="scss" scoped>
.banner-swiper {
  width: 100%;
  height: 360rpx;

  &__item {
    position: relative;
    width: 100%;
    height: 100%;
  }

  &__image {
    width: 100%;
    height: 100%;
  }

  &__overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
    display: flex;
    align-items: flex-end;
    padding: var(--space-3, 24rpx) var(--space-4, 32rpx);
  }

  &__text {
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-size: 36rpx;
    font-weight: 600;
    color: #ffffff;
  }

  &__subtitle {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.85);
    margin-top: 8rpx;
  }
}
</style>
