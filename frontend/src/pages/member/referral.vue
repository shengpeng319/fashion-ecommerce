<template>
  <view class="referral-page">
    <view class="share-banner">
      <text class="sb-icon">🎁</text>
      <text class="sb-title">邀请好友得积分</text>
      <text class="sb-desc">好友成为共创员/共创官并完成首单消费，您将获得积分返利</text>
    </view>

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

    <view class="section-card" v-if="memberData?.user?.referrerId">
      <text class="sc-title">我的推荐人</text>
      <text class="info-text">您已通过推荐人加入，首单消费后推荐人将获得积分奖励</text>
    </view>

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
  background: #F5F5F5;
  padding-bottom: 40rpx;
}

.share-banner {
  background: #FFFFFF;
  padding: 48rpx 32rpx;
  text-align: center;
}

.sb-icon {
  font-size: 48rpx;
  display: block;
  margin-bottom: 16rpx;
}

.sb-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
  display: block;
  margin-bottom: 12rpx;
}

.sb-desc {
  font-size: 24rpx;
  color: #999999;
  line-height: 1.5;
}

.input-card {
  margin: 20rpx 24rpx 0;
  padding: 28rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
}

.ic-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16rpx;
  display: block;
}

.ic-row {
  display: flex;
  gap: 16rpx;
}

.ic-input {
  flex: 1;
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #1A1A1A;
}

.ph {
  color: #999999;
  font-size: 26rpx;
}

.ic-btn {
  padding: 0 36rpx;
  height: 80rpx;
  background: #C8102E;
  border-radius: 44rpx;
  display: flex;
  align-items: center;

  text {
    font-size: 26rpx;
    font-weight: 600;
    color: #FFFFFF;
  }

  &:active {
    opacity: 0.85;
  }
}

.ic-hint {
  font-size: 20rpx;
  color: #999999;
  margin-top: 16rpx;
  display: block;
}

.badge-card {
  text-align: center;
  padding: 48rpx;
}

.bc-check {
  font-size: 48rpx;
  color: #43A047;
  display: block;
  margin-bottom: 12rpx;
}

.bc-text {
  font-size: 28rpx;
  color: #1A1A1A;
  font-weight: 500;
}

.section-card {
  margin: 20rpx 24rpx 0;
  padding: 28rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
}

.sc-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 20rpx;
}

.ref-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F0F0F0;

  &:last-child {
    border-bottom: none;
  }
}

.ref-status {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
  color: #999999;
  background: #F5F5F5;
}

.ref-status.COMPLETED {
  color: #43A047;
  background: #F0F8F0;
}

.ref-points {
  font-size: 26rpx;
  font-weight: 600;
  color: #C8102E;
  display: block;
}

.ref-time {
  font-size: 20rpx;
  color: #999999;
}

.info-text {
  font-size: 24rpx;
  color: #999999;
  line-height: 1.6;
}
</style>
