<template>
  <view class="story">
    <view class="story__top-gradient" />

    <view class="story__header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="story__brand">洋玥设计</text>
      <text class="story__tagline">YANGYUE DESIGN</text>
    </view>

    <view class="story__progress" :style="{ top: progressTop + 'rpx' }">
      <view
        v-for="(item, i) in preparedProducts"
        :key="'h' + i"
        class="story__progress-bar"
      >
        <view
          class="story__progress-fill"
          :style="hIndex === i ? { width: hProgress + '%' } : { width: i < hIndex ? '100%' : '0%' }"
        />
      </view>
    </view>

    <view
      v-if="currentImageCount > 1"
      class="story__v-progress"
    >
      <view
        v-for="(img, vi) in currentImageList"
        :key="'v' + vi"
        class="story__v-progress-bar"
        :class="{ 'story__v-progress-bar--active': vi <= vIndex }"
      />
    </view>

    <view class="story__counter" :style="{ top: (progressTop + 22) + 'rpx' }">
      <text class="story__counter-text">{{ hIndex + 1 }}/{{ preparedProducts.length }}</text>
    </view>

    <swiper
      class="story__h-swiper"
      :current="hIndex"
      :circular="true"
      :duration="350"
      :autoplay="false"
      @change="onHChange"
    >
      <swiper-item v-for="(product, pi) in preparedProducts" :key="product.id || pi">
        <swiper
          class="story__v-swiper"
          :current="vIndex"
          :duration="300"
          :autoplay="false"
          vertical
          @change="onVChange"
        >
          <swiper-item v-for="(img, vi) in product.imageList" :key="vi">
            <view class="story-card" @tap="onTap">
              <image
                :src="img"
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

                <view v-if="vIndex === 0 && currentImageCount > 1" class="story-card__swipe-hint">
                  <view class="story-card__swipe-arrow" />
                  <text class="story-card__swipe-text">向下滑动查看更多</text>
                </view>
              </view>
            </view>
          </swiper-item>
        </swiper>
      </swiper-item>
    </swiper>
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

const hIndex = ref(0)
const vIndex = ref(0)
const hProgress = ref(0)
const isPlaying = ref(true)
const statusBarHeight = ref(44)

let hTimer: any = null
let isHChanging = false

try {
  const sysInfo = uni.getWindowInfo()
  statusBarHeight.value = sysInfo.statusBarHeight || 44
} catch {}

const progressTop = computed(() => statusBarHeight.value * 2 + 120)

const preparedProducts = computed(() => {
  return (props.products || []).map((p: any) => {
    let images: string[] = []
    try {
      const parsed = JSON.parse(p.images || '[]')
      if (Array.isArray(parsed) && parsed.length) {
        images = parsed.filter((url: string) => url)
      }
    } catch {}
    if (!images.length && p.image) images = [p.image]
    if (!images.length && p.thumbnail) images = [p.thumbnail]
    if (!images.length) images = ['']
    if (images.length === 1) {
      images = [images[0], images[0], images[0]]
    }
    return { ...p, imageList: images }
  })
})

const currentImageList = computed(() => {
  const p = preparedProducts.value[hIndex.value]
  return p ? p.imageList : []
})

const currentImageCount = computed(() => currentImageList.value.length)

const startHTimer = () => {
  clearHTimer()
  if (!preparedProducts.value.length) return
  hProgress.value = 0
  isPlaying.value = true
  const step = 100 / (props.duration / 50)
  hTimer = setInterval(() => {
    hProgress.value += step
    if (hProgress.value >= 100) {
      hProgress.value = 100
      clearHTimer()
      if (hIndex.value < preparedProducts.value.length - 1) {
        hIndex.value++
      } else {
        hIndex.value = 0
      }
    }
  }, 50)
}

const clearHTimer = () => {
  if (hTimer) { clearInterval(hTimer); hTimer = null }
}

const onHChange = (e: any) => {
  if (isHChanging) return
  isHChanging = true
  hIndex.value = e.detail.current
  vIndex.value = 0
  startHTimer()
  setTimeout(() => { isHChanging = false }, 300)
}

const onVChange = (e: any) => {
  const newV = e.detail.current
  vIndex.value = newV
  if (newV === 0) {
    startHTimer()
  } else {
    clearHTimer()
    isPlaying.value = false
  }
}

const onTap = () => {
  if (vIndex.value > 0) return
  if (isPlaying.value) {
    clearHTimer()
    isPlaying.value = false
  } else {
    startHTimer()
  }
}

const onBuy = (id: string) => {
  if (!id) return
  emit('click', id)
}

watch(() => props.products, (val) => {
  if (val && val.length) {
    hIndex.value = 0
    vIndex.value = 0
    startHTimer()
  }
}, { immediate: true })

onUnmounted(() => {
  clearHTimer()
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
    height: 320rpx;
    background: linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%);
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
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4rpx;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4rpx;
    transition: width 0.05s linear;
  }

  &__v-progress {
    position: absolute;
    right: 16rpx;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    z-index: 20;
    height: 200rpx;
  }

  &__v-progress-bar {
    flex: 1;
    width: 4rpx;
    min-height: 0;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4rpx;
    transition: all 0.3s ease;

    &--active {
      background: rgba(255, 255, 255, 0.6);
    }
  }

  &__counter {
    position: absolute;
    right: 28rpx;
    z-index: 20;
  }

  &__counter-text {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.45);
    font-weight: 500;
  }

  &__h-swiper {
    width: 100%;
    height: 100%;
  }

  &__v-swiper {
    width: 100%;
    height: 100%;
  }
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
  }

  &__btn-text {
    font-size: 28rpx;
    color: #FFFFFF;
    font-weight: 600;
    letter-spacing: 4rpx;
  }

  &__swipe-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 40rpx;
  }

  &__swipe-arrow {
    width: 0;
    height: 0;
    border-left: 14rpx solid transparent;
    border-right: 14rpx solid transparent;
    border-top: 18rpx solid rgba(255, 255, 255, 0.45);
    animation: cardSwipeBounce 1.5s ease-in-out infinite;
  }

  &__swipe-text {
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.3);
    margin-top: 8rpx;
    letter-spacing: 2rpx;
  }
}

@keyframes cardSwipeBounce {
  0%, 100% { transform: translateY(0); opacity: 0.3; }
  50% { transform: translateY(10rpx); opacity: 0.7; }
}
</style>
