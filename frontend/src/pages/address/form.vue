<template>
  <view class="form-page">
    <view class="form-group">
      <text class="fg-label">收件人</text>
      <input v-model="form.name" placeholder="请输入姓名" placeholder-class="ph" class="fg-input" />
    </view>
    <view class="form-group">
      <text class="fg-label">手机号</text>
      <input v-model="form.phone" type="number" maxlength="11" placeholder="请输入手机号" placeholder-class="ph" class="fg-input" />
    </view>
    <view class="form-group">
      <text class="fg-label">省份</text>
      <picker :value="provinceIndex" :range="provinces" @change="onProvinceChange">
        <view class="fg-picker">
          <text :class="{ placeholder: !form.province }">{{ form.province || '请选择省份' }}</text>
          <text class="fg-arrow">›</text>
        </view>
      </picker>
    </view>
    <view class="form-group" v-if="form.province">
      <text class="fg-label">城市</text>
      <picker :value="cityIndex" :range="cities" @change="onCityChange">
        <view class="fg-picker">
          <text :class="{ placeholder: !form.city }">{{ form.city || '请选择城市' }}</text>
          <text class="fg-arrow">›</text>
        </view>
      </picker>
    </view>
    <view class="form-group" v-if="form.city">
      <text class="fg-label">区/县</text>
      <picker :value="districtIndex" :range="districts" @change="onDistrictChange">
        <view class="fg-picker">
          <text :class="{ placeholder: !form.district }">{{ form.district || '请选择区县' }}</text>
          <text class="fg-arrow">›</text>
        </view>
      </picker>
    </view>
    <view class="form-group">
      <text class="fg-label">详细地址</text>
      <input v-model="form.detail" placeholder="街道、楼栋、门牌号" placeholder-class="ph" class="fg-input" />
    </view>
    <view class="form-group fg-switch">
      <text class="fg-label">设为默认地址</text>
      <switch :checked="form.isDefault" @change="form.isDefault = $event.detail.value" color="#6B1D2F" />
    </view>

    <view class="save-btn" @tap="saveAddress">
      <text>保存地址</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

const form = ref({ id: '', name: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: false })

const provinces = ['北京', '上海', '广东', '浙江', '江苏', '四川', '湖北', '湖南', '河南', '河北']
const provinceData: Record<string, string[]> = {
  '北京': ['北京'],
  '上海': ['上海'],
  '广东': ['广州', '深圳', '佛山', '东莞', '珠海'],
  '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州'],
  '江苏': ['南京', '苏州', '无锡', '常州', '南通'],
  '四川': ['成都'],
  '湖北': ['武汉'],
  '湖南': ['长沙'],
  '河南': ['郑州'],
  '河北': ['石家庄']
}
const districtData: Record<string, string[]> = {}

const provinceIndex = ref(-1), cityIndex = ref(-1), districtIndex = ref(-1)

const cities = computed(() => provinceData[form.value.province] || [])
const districts = computed(() => {
  if (!form.value.city) return []
  return districtData[form.value.city] || [form.value.city]
})

onLoad(async (opt: any) => {
  if (opt.id) { form.value.id = opt.id; await loadAddress(opt.id) }
})

const loadAddress = async (id: string) => {
  try {
    const addresses: any[] = await request('/addresses', 'GET')
    const addr = addresses.find((a: any) => a.id === id)
    if (addr) {
      form.value = { ...addr }
      provinceIndex.value = provinces.indexOf(addr.province)
      cityIndex.value = cities.value.indexOf(addr.city)
    }
  } catch (e) {}
}

const onProvinceChange = (e: any) => { form.value.province = provinces[e.detail.value]; form.value.city = ''; form.value.district = ''; cityIndex.value = -1 }
const onCityChange = (e: any) => { form.value.city = cities.value[e.detail.value]; form.value.district = '' }
const onDistrictChange = (e: any) => { form.value.district = districts.value[e.detail.value] || '' }

const saveAddress = async () => {
  if (!form.value.name) return uni.showToast({ title: '请输入姓名', icon: 'none' })
  if (!form.value.phone) return uni.showToast({ title: '请输入手机号', icon: 'none' })
  if (!form.value.province || !form.value.city || !form.value.district) return uni.showToast({ title: '请选择完整地址', icon: 'none' })
  if (!form.value.detail) return uni.showToast({ title: '请输入详细地址', icon: 'none' })
  try {
    if (form.value.id) await request(`/addresses/${form.value.id}`, 'PUT', form.value)
    else await request('/addresses', 'POST', form.value)
    uni.showToast({ title: '保存成功！', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 800)
  } catch (e: any) { uni.showToast({ title: e.error || '保存失败', icon: 'none' }) }
}
</script>

<style lang="scss" scoped>
.form-page { padding: 24rpx; background: var(--color-bg); min-height: 100vh; }
.form-group {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 24rpx 28rpx;
  margin-bottom: 16rpx;
}
.fg-label {
  display: block;
  font-size: 20rpx;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 3rpx;
  margin-bottom: 14rpx;
}
.fg-input {
  font-size: 30rpx;
  color: var(--color-text);
  font-family: var(--font-body);
}
.ph { color: var(--color-text-muted); font-size: 28rpx; }
.fg-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 30rpx;
  color: var(--color-text);
  .placeholder { color: var(--color-text-muted); }
}
.fg-arrow { font-size: 32rpx; color: var(--color-text-muted); }
.fg-switch { display: flex; justify-content: space-between; align-items: center; .fg-label { margin-bottom: 0; } }
.save-btn {
  height: 88rpx;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40rpx;
  border-radius: var(--radius-sm);
  &:active { opacity: 0.85; }
  text { font-size: 28rpx; font-weight: 600; color: #fff; letter-spacing: 4rpx; }
}
</style>
