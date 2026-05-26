<template>
  <view class="upgrade-page">
    <!-- Current Level -->
    <view class="current-card">
      <text class="cc-label">当前等级</text>
      <text class="cc-name">{{ currentLevel?.name || '轻会员' }}</text>
      <text class="cc-points">{{ memberData?.points || 0 }} 积分</text>
    </view>

    <!-- Level Options -->
    <view class="level-list">
      <view v-for="level in upgradableLevels" :key="level.key" class="level-card"
        :class="{ selected: selectedLevel === level.key }" @tap="selectLevel(level.key)">
        <view class="lc-header">
          <text class="lc-name">{{ level.name }}</text>
          <text class="lc-deposit" v-if="level.minDeposit > 0">¥{{ level.minDeposit }}</text>
          <text class="lc-deposit free" v-else>免费</text>
        </view>
        <view class="lc-bonus" v-if="level.bonusPoints > 0">
          <text>到账 {{ level.bonusPoints }} 积分</text>
        </view>
        <view class="lc-benefits" v-if="level.benefits">
          <text v-for="(b, i) in parseBenefits(level.benefits)" :key="i" class="lc-b-item">◆ {{ b }}</text>
        </view>
        <view class="lc-bottom">
          <text class="lc-refundable" v-if="level.isRefundable">余额可退</text>
          <text class="lc-not-refundable" v-else>权益金不退还</text>
          <view class="lc-radio" :class="{ on: selectedLevel === level.key }">
            <text v-if="selectedLevel === level.key">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Upgrade Button -->
    <view class="btn-area">
      <view class="btn-upgrade" :class="{ disabled: !selectedLevel || loading }" @tap="handleUpgrade">
        <text>{{ loading ? '处理中...' : '确认升级' }}</text>
      </view>
    </view>

    <!-- Payment Popup -->
    <PaymentPopup
      :visible="showPayment"
      title="升级支付"
      :amount="paymentAmount"
      @confirm="handlePaymentConfirm"
      @cancel="showPayment = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request, getToken } from '@/utils/request'
import PaymentPopup from '@/components/PaymentPopup.vue'

const memberData = ref<any>(null)
const allLevels = ref<any[]>([])
const selectedLevel = ref('')
const loading = ref(false)
const showPayment = ref(false)
const paymentAmount = ref(0)

const currentLevel = computed(() =>
  allLevels.value.find((l: any) => l.key === memberData.value?.level)
)

const upgradableLevels = computed(() => {
  const currentOrder = currentLevel.value?.sortOrder || 0
  return allLevels.value.filter((l: any) => l.sortOrder > currentOrder)
})

const parseBenefits = (benefits: string) => {
  try { return JSON.parse(benefits) } catch { return [] }
}

const selectLevel = (key: string) => { selectedLevel.value = key }

const loadData = async () => {
  if (!getToken()) return
  try {
    const [member, levels] = await Promise.all([
      request('/member/profile', 'GET'),
      request('/member/levels', 'GET')
    ])
    memberData.value = member
    allLevels.value = levels || []
  } catch (e) { console.error(e) }
}

onShow(() => loadData())

const handleUpgrade = async () => {
  if (!selectedLevel.value || loading.value) return
  const level = allLevels.value.find((l: any) => l.key === selectedLevel.value)
  if (!level) return

  if (level.minDeposit > 0) {
    paymentAmount.value = level.minDeposit
    showPayment.value = true
  } else {
    await doUpgrade()
  }
}

const handlePaymentConfirm = async () => {
  showPayment.value = false
  await doUpgrade()
}

const doUpgrade = async () => {
  loading.value = true
  try {
    const res: any = await request('/member/upgrade', 'POST', { targetLevel: selectedLevel.value })
    if (res.success) {
      uni.showToast({ title: `升级成功！获赠${res.bonusPoints}积分`, icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  } catch (e: any) {
    uni.showToast({ title: e.error || '升级失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.upgrade-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 140rpx;
}

.current-card {
  background: var(--color-dark);
  padding: 48rpx 32rpx;
  text-align: center;
}
.cc-label { font-size: 22rpx; color: var(--color-text-muted); letter-spacing: 4rpx; display: block; margin-bottom: 8rpx; }
.cc-name { font-family: var(--font-display); font-size: 40rpx; font-weight: 700; color: var(--color-gold); display: block; margin-bottom: 8rpx; }
.cc-points { font-size: 24rpx; color: var(--color-text-muted); display: block; }

.level-list { padding: 24rpx; display: flex; flex-direction: column; gap: 20rpx; }

.level-card {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  padding: 32rpx 28rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;
  &.selected { border-color: var(--color-gold); background: rgba(201,169,110,0.04); }
}
.lc-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12rpx; }
.lc-name { font-family: var(--font-display); font-size: 32rpx; font-weight: 600; color: var(--color-text); }
.lc-deposit { font-family: var(--font-display); font-size: 36rpx; font-weight: 700; color: var(--color-primary); }
.lc-deposit.free { color: var(--color-accent); font-size: 28rpx; }
.lc-bonus { margin-bottom: 16rpx; }
.lc-bonus text { font-size: 24rpx; color: var(--color-gold); font-weight: 500; }
.lc-benefits { display: flex; flex-wrap: wrap; gap: 8rpx; margin-bottom: 20rpx; }
.lc-b-item { font-size: 22rpx; color: var(--color-text-muted); line-height: 1.6; flex-basis: calc(50% - 4rpx); }
.lc-bottom { display: flex; justify-content: space-between; align-items: center; }
.lc-refundable { font-size: 20rpx; color: var(--color-accent); }
.lc-not-refundable { font-size: 20rpx; color: var(--color-text-muted); }
.lc-radio { width: 40rpx; height: 40rpx; border-radius: 50%; border: 2rpx solid var(--color-border); display: flex; align-items: center; justify-content: center; transition: all 0.2s;
  &.on { background: var(--color-gold); border-color: var(--color-gold); text { color: #fff; font-size: 24rpx; } }
}

.btn-area { position: fixed; bottom: 0; left: 0; right: 0; padding: 20rpx 24rpx; background: var(--color-card); }
.btn-upgrade { height: 88rpx; background: var(--color-primary); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center;
  text { font-size: 28rpx; font-weight: 600; color: #fff; letter-spacing: 4rpx; }
  &.disabled { opacity: 0.5; }
}
</style>
