<template>
  <view class="referral-page">
    <!-- Share Banner -->
    <view class="share-banner">
      <text class="sb-icon">☆</text>
      <text class="sb-title">邀请好友加入美学共创</text>
      <text class="sb-desc">好友成为共创员/共创官并完成首单消费，您将获得积分返利</text>
    </view>

    <!-- Input referral code -->
    <view class="input-card" v-if="!hasReferrer">
      <text class="ic-label">绑定推荐人</text>
      <view class="ic-row">
        <input v-model="referrerPhone" placeholder="输入推荐人手机号" placeholder-class="ph" class="ic-input" type="number" maxlength="11" />
        <view class="ic-btn" @tap="submitReferral">
          <text>提交</text>
        </view>
      </view>
      <text class="ic-hint">仅支持美学共创员/共创官作为推荐人</text>
    </view>

    <view v-else class="input-card badge-card">
      <text class="bc-check">✓</text>
      <text class="bc-text">已绑定推荐关系</text>
    </view>

    <!-- My Referrals -->
    <view class="section-card" v-if="referrals.length > 0">
      <text class="sc-title">我的邀请记录</text>
      <view v-for="r in referrals" :key="r.id" class="ref-item">
        <view class="ref-left">
          <text class="ref-status" :class="r.status">
            {{ r.status === 'COMPLETED' ? '已完成' : '待完成' }}
          </text>
        </view>
        <view class="ref-right">
          <text class="ref-points" v-if="r.pointsAwarded > 0">+{{ r.pointsAwarded }}积分</text>
          <text class="ref-time">{{ formatTime(r.createdAt) }}</text>
        </view>
      </view>
    </view>

    <!-- My referrer info -->
    <view class="section-card" v-if="memberData?.user?.referrerId">
      <text class="sc-title">我的推荐人</text>
      <text class="info-text">您已通过推荐人加入，首单消费后推荐人将获得积分奖励</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request, getToken } from '@/utils/request'

const memberData = ref<any>(null)
const referrals = ref<any[]>([])
const referrerPhone = ref('')
const hasReferrer = ref(false)

const formatTime = (t: string) => {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
}

const loadData = async () => {
  if (!getToken()) return
  try {
    const [member, refs] = await Promise.all([
      request('/member/profile', 'GET'),
      request('/member/referrals', 'GET')
    ])
    memberData.value = member
    referrals.value = refs || []
    hasReferrer.value = !!member?.user?.referrerId
  } catch (e) { console.error(e) }
}

onShow(() => loadData())

const submitReferral = async () => {
  if (!referrerPhone.value) {
    uni.showToast({ title: '请输入推荐人手机号', icon: 'none' })
    return
  }
  try {
    await request('/member/referral', 'POST', { referrerPhone: referrerPhone.value })
    uni.showToast({ title: '绑定成功', icon: 'success' })
    loadData()
  } catch (e: any) {
    uni.showToast({ title: e.error || '绑定失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.referral-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 40rpx;
}

.share-banner {
  background: linear-gradient(135deg, var(--color-dark), #3D2025);
  padding: 56rpx 32rpx;
  text-align: center;
}
.sb-icon { font-size: 48rpx; color: var(--color-gold); display: block; margin-bottom: 16rpx; }
.sb-title { font-family: var(--font-display); font-size: 32rpx; font-weight: 600; color: #fff; display: block; margin-bottom: 12rpx; }
.sb-desc { font-size: 24rpx; color: var(--color-text-muted); line-height: 1.5; }

.input-card {
  margin: 24rpx;
  padding: 28rpx;
  background: var(--color-card);
  border-radius: var(--radius-xl);
}
.ic-label { font-size: 26rpx; font-weight: 600; color: var(--color-text); margin-bottom: 16rpx; display: block; }
.ic-row { display: flex; gap: 16rpx; }
.ic-input {
  flex: 1;
  height: 80rpx;
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  padding: 0 20rpx;
  font-size: 28rpx;
  color: var(--color-text);
}
.ph { color: var(--color-text-muted); font-size: 26rpx; }
.ic-btn { padding: 0 36rpx; height: 80rpx; background: var(--color-primary); border-radius: var(--radius-sm); display: flex; align-items: center;
  text { font-size: 26rpx; font-weight: 600; color: #fff; }
}
.ic-hint { font-size: 20rpx; color: var(--color-text-muted); margin-top: 16rpx; display: block; }

.badge-card { text-align: center; padding: 48rpx; }
.bc-check { font-size: 48rpx; color: var(--color-accent); display: block; margin-bottom: 12rpx; }
.bc-text { font-size: 28rpx; color: var(--color-text); font-weight: 500; }

.section-card {
  margin: 0 24rpx 24rpx;
  padding: 28rpx;
  background: var(--color-card);
  border-radius: var(--radius-xl);
}
.sc-title { font-family: var(--font-display); font-size: 28rpx; font-weight: 600; color: var(--color-text); margin-bottom: 20rpx; }

.ref-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid var(--color-divider);
  &:last-child { border-bottom: none; }
}
.ref-status { font-size: 24rpx; padding: 4rpx 16rpx; border-radius: 16rpx; color: var(--color-text-muted); background: var(--color-surface); }
.ref-status.COMPLETED { color: var(--color-accent); background: rgba(67,160,71,0.1); }
.ref-points { font-family: var(--font-display); font-size: 26rpx; font-weight: 600; color: var(--color-gold); display: block; }
.ref-time { font-size: 20rpx; color: var(--color-text-muted); }

.info-text { font-size: 24rpx; color: var(--color-text-muted); line-height: 1.6; }
</style>
