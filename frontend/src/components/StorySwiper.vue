<template>
  <view class="story">
    <view class="story__top-gradient" />

    <view class="story__header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="story__brand">洋玥设计</text>
      <text class="story__tagline">YANGYUE DESIGN</text>
    </view>

    <view class="story__progress" :style="{ top: progressTop + 'rpx' }">
      <view
        v-for="(item, i) in products"
        :key="i"
        class="story__progress-bar"
      >
        <view
          class="story__progress-fill"
          :style="i === current ? { width: progressWidth + '%' } : {
            width: i < current ? '100%' : '0%'
          }"
        />
      </view>
    </view>

    <view class="story__counter" :style="{ top: counterTop + 'rpx' }">
      <text class="story__counter-text">{{ current + 1 }} / {{ products.length }}</text>
    </view>

    <swiper
      class="story__swiper"
      :current="current"
      :circular="true"
      :duration="350"
      :autoplay="false"
      :indicator-dots="false"
      @change="onChange"
    >
      <swiper-item v-for="(product, i) in products" :key="product.id || i">
        <view class="story-card" @tap="onTap">
          <image
            :src="product.image || product.thumbnail"
            mode="aspectFill"
            class="story-card__image"
            lazy-load
          />
          <view class="story-card__gradient" />

          <view class="story-card__content">
            <text v-if="product.subtitle" class="story-card__subtitle">{{ product.subtitle }}</text>
            <text class="story-card__name">{{ product.name }}</text>
            <view class="story-card__price-row">
              <text class="story-card__price">¥{{ product.price }}</text>
              <text v-if="product.originalPrice" class="story-card__original">¥{{ product.originalPrice }}</text>
            </view>
            <view class="story-card__btn" @tap.stop="onBuy(product.id)">
              <text class="story-card__btn-text">立即购买</text>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <view v-if="showHint" class="story__hint">
      <text class="story__hint-text">← 左右滑动浏览 →</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  products?: any[]
  duration?: number
}>(), {
  products: () => [],
  duration: 4000
})

const emit = defineEmits<{
  click: [id: string]
}>()

const current = ref(0)
const playing = ref(true)
const progressWidth = ref(0)
const showHint = ref(true)
const statusBarHeight = ref(44)

let timer: any = null
let hintTimer: any = null

try {
  const sysInfo = uni.getWindowInfo()
  statusBarHeight.value = sysInfo.statusBarHeight || 44
} catch {}

const progressTop = computed(() => statusBarHeight.value * 2 + 120)
const counterTop = computed(() => statusBarHeight.value * 2 + 130)

const startTimer = () => {
  clearTimer()
  if (!props.products.length) return
  progressWidth.value = 0
  playing.value = true
  const step = 100 / (props.duration / 50)
  timer = setInterval(() => {
    progressWidth.value += step
    if (progressWidth.value >= 100) {
      progressWidth.value = 100
      clearTimer()
      if (current.value < props.products.length - 1) {
        current.value++
      } else {
        current.value = 0
      }
    }
  }, 50)
}

const clearTimer = () => {
  if (timer) { clearInterval(timer); timer = null }
}

const onChange = (e: any) => {
  current.value = e.detail.current
  startTimer()
}

const onTap = () => {
  if (playing.value) {
    clearTimer()
    playing.value = false
  } else {
    startTimer()
  }
}

const onBuy = (id: string) => {
  if (!id) return
  emit('click', id)
}

watch(() => props.products, (val) => {
  if (val && val.length) {
    current.value = 0
    startTimer()
    hintTimer = setTimeout(() => { showHint.value = false }, 4000)
  }
}, { immediate: true })

onUnmounted(() => {
  clearTimer()
  if (hintTimer) clearTimeout(hintTimer)
})
</script>

<style lang="scss" scoped>
.story {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;

  &__top-gradient {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 300rpx;
    background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%);
    z-index: 15;
    pointer-events: none;
  }

  &__header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    text-align: center;
    z-index: 20;
    padding-bottom: 8rpx;
  }

  &__brand {
    display: block;
    font-size: 44rpx;
    font-weight: 800;
    color: #FFFFFF;
    letter-spacing: 12rpx;
    text-shadow: 0 2rpx 16rpx rgba(0,0,0,0.4);
  }

  &__tagline {
    display: block;
    font-size: 18rpx;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 4rpx;
    margin-top: 4rpx;
    font-weight: 300;
  }

  &__progress {
    position: absolute;
    left: 24rpx;
    right: 24rpx;
    display: flex;
    gap: 8rpx;
    z-index: 20;
  }

  &__progress-bar {
    flex: 1;
    height: 4rpx;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 4rpx;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4rpx;
    transition: width 0.05s linear;
  }

  &__counter {
    position: absolute;
    right: 28rpx;
    z-index: 20;
  }

  &__counter-text {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
  }

  &__swiper {
    width: 100%;
    height: 100%;
  }

  &__hint {
    position: absolute;
    bottom: 200rpx;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 20;
    animation: storyHintPulse 1.5s ease-in-out infinite;
  }

  &__hint-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.6);
  }
}

@keyframes storyHintPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

.story-card {
  position: relative;
  width: 100%;
  height: 100%;

  &__image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 55%;
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
  }

  &__content {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 0 48rpx 120rpx;
    box-sizing: border-box;
    z-index: 10;
  }

  &__subtitle {
    display: block;
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 8rpx;
    letter-spacing: 1rpx;
  }

  &__name {
    display: block;
    font-size: 44rpx;
    color: #FFFFFF;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 20rpx;
    text-shadow: 0 2rpx 12rpx rgba(0,0,0,0.5);
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    gap: 16rpx;
    margin-bottom: 36rpx;
  }

  &__price {
    font-size: 48rpx;
    color: #FFFFFF;
    font-weight: 700;
    text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.4);
  }

  &__original {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.45);
    text-decoration: line-through;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 2rpx solid rgba(255, 255, 255, 0.6);
    border-radius: 999rpx;
    padding: 22rpx 64rpx;
    backdrop-filter: blur(20rpx);
  }

  &__btn-text {
    font-size: 28rpx;
    color: #FFFFFF;
    font-weight: 600;
    letter-spacing: 4rpx;
  }
}
</style>
