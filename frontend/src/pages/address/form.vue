<template>
  <view class="address-form">
    <view class="form-item">
      <text class="label">收货人</text>
      <input v-model="form.name" placeholder="请输入收货人姓名" />
    </view>
    <view class="form-item">
      <text class="label">手机号</text>
      <input v-model="form.phone" type="number" maxlength="11" placeholder="请输入手机号" />
    </view>
    <view class="form-item">
      <text class="label">省份</text>
      <picker :value="provinceIndex" :range="provinces" @change="onProvinceChange">
        <view class="picker-value">
          <text>{{ form.province || '请选择省份' }}</text>
          <text class="arrow">›</text>
        </view>
      </picker>
    </view>
    <view class="form-item" v-if="form.province">
      <text class="label">城市</text>
      <picker :value="cityIndex" :range="cities" @change="onCityChange">
        <view class="picker-value">
          <text>{{ form.city || '请选择城市' }}</text>
          <text class="arrow">›</text>
        </view>
      </picker>
    </view>
    <view class="form-item" v-if="form.city">
      <text class="label">区县</text>
      <picker :value="districtIndex" :range="districts" @change="onDistrictChange">
        <view class="picker-value">
          <text>{{ form.district || '请选择区县' }}</text>
          <text class="arrow">›</text>
        </view>
      </picker>
    </view>
    <view class="form-item">
      <text class="label">详细地址</text>
      <input v-model="form.detail" placeholder="请输入详细地址（街道、门牌号等）" />
    </view>
    <view class="form-item switch-item">
      <text class="label">设为默认地址</text>
      <switch :checked="form.isDefault" @change="form.isDefault = $event.detail.value" color="#ff5777" />
    </view>
    
    <button class="save-btn" @tap="saveAddress">保存地址</button>
  </view>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

const form = ref({
  id: '',
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省', '湖南省', '河南省', '河北省']
const provinceData: Record<string, string[]> = {
  '北京市': ['北京市'],
  '上海市': ['上海市'],
  '广东省': ['广州市', '深圳市', '佛山市', '东莞市', '珠海市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市'],
  '江苏省': ['南京市', '苏州市', '无锡市', '常州市', '南通市'],
  '四川省': ['成都市', '绵阳市', '德阳市', '宜宾市', '南充市'],
  '湖北省': ['武汉市', '宜昌市', '襄阳市', '荆州市', '黄冈市'],
  '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '岳阳市'],
  '河南省': ['郑州市', '洛阳市', '开封市', '南阳市', '新乡市'],
  '河北省': ['石家庄市', '唐山市', '保定市', '邯郸市', '秦皇岛市']
}
const districtData: Record<string, string[]> = {
  '北京市': { '北京市': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区'] },
  '上海市': { '上海市': ['黄浦区', '徐汇区', '浦东新区', '静安区', '长宁区', '虹口区'] },
  '广州市': { '天河区': ['天河南街道', '石牌街道', '棠下街道', '员村街道'],
              '海珠区': ['赤岗街道', '新港街道', '昌岗街道', '江南中街道'],
              '越秀区': ['洪桥街道', '北京街道', '六榕街道', '流花街道'],
              '白云区': ['三元里街道', '景泰街道', '棠景街道', '新市街道'] },
  '深圳市': { '福田区': ['园岭街道', '南园街道', '福田街道', '沙头街道'],
              '南山区': ['南山街道', '招商街道', '蛇口街道', '粤海街道'],
              '宝安区': ['新安街道', '西乡街道', '福永街道', '沙井街道'] },
  '杭州市': { '西湖区': ['北山街道', '西溪街道', '翠苑街道', '文新街道'],
              '上城区': ['清波街道', '湖滨街道', '小营街道', '望江街道'],
              '滨江区': ['西兴街道', '长河街道', '浦沿街道'] },
  '宁波市': { '海曙区': ['月湖街道', '西门街道', '江厦街道', '南门街道'],
              '江北区': ['外滩街道', '文教街道', '孔浦街道', '甬江街道'] },
  '南京市': { '玄武区': ['新街口街道', '梅园街道', '孝陵卫街道', '锁金村街道'],
              '秦淮区': ['秦虹街道', '夫子庙街道', '双塘街道', '中华门街道'] },
  '苏州市': { '姑苏区': ['观前街道', '平江路街道', '金阊街道', '沧浪街道'],
              '工业园区': ['湖西街道', '湖东街道', '东沙湖街道', '月亮湾街道'] },
  '成都市': { '锦江区': ['春熙路街道', '书院街街道', '牛市口街道', '东湖街道'],
              '青羊区': ['太升路街道', '草市街街道', '西御街街道', '草堂路街道'],
              '武侯区': ['跳伞塔街道', '玉林街道', '浆洗街街道', '望江路街道'] },
  '武汉市': { '江汉区': ['唐家墩街道', '前进街道', '民意街道', '新华街道'],
              '武昌区': ['杨园街道', '徐家棚街道', '积玉桥街道', '中华路街道'],
              '洪山区': ['珞南街道', '关山街道', '狮子山街道', '张家湾街道'] },
  '长沙市': { '芙蓉区': ['文艺路街道', '朝阳街街道', '韭菜园街道', '五里牌街道'],
              '岳麓区': ['桔子洲街道', '岳麓街道', '望月湖街道', '银盆岭街道'],
              '天心区': ['坡子街街道', '城南路街道', '裕南街街道', '金盆岭街道'] },
  '郑州市': { '中原区': ['林山寨街道', '建设路街道', '棉纺路街道', '秦岭路街道'],
              '二七区': ['蜜蜂张街道', '五里堡街道', '大学路街道', '铭功路街道'],
              '管城区': ['北下街街道', '西大街街道', '南关街街道', '城东路街道'] },
  '石家庄市': { '长安区': ['建北街道', '青园街道', '广安街道', '育才街道'],
                '桥西区': ['友谊街道', '维明街道', '东里街道', '中山街道'],
                '新华区': ['革新街道', '新华路街道', '宁安街道', '西苑街道'] }
}

// Default districts for cities not in the map
for (const province of Object.keys(provinceData)) {
  for (const city of provinceData[province]) {
    if (!districtData[city]) {
      districtData[city] = { [city]: ['中心城区', '东区', '西区', '南区', '北区'] }
    }
  }
}

const provinceIndex = ref(-1)
const cityIndex = ref(-1)
const districtIndex = ref(-1)

const cities = computed(() => {
  if (!form.value.province) return []
  return provinceData[form.value.province] || []
})

const districts = computed(() => {
  if (!form.value.city) return []
  const cityDistricts = districtData[form.value.city]
  if (!cityDistricts) return []
  return cityDistricts[form.value.city] || Object.values(cityDistricts)[0] || []
})

onLoad(async (opt: any) => {
  if (opt.id) {
    form.value.id = opt.id
    await loadAddress(opt.id)
  }
})

const loadAddress = async (id: string) => {
  try {
    const addresses: any[] = await request('/addresses', 'GET')
    const addr = addresses.find((a: any) => a.id === id)
    if (addr) {
      form.value = { ...addr }
      // Set picker indices
      provinceIndex.value = provinces.indexOf(addr.province)
      cityIndex.value = cities.value.indexOf(addr.city)
      districtIndex.value = districts.value.indexOf(addr.district)
    }
  } catch (e) {
    console.error('load address error', e)
  }
}

const onProvinceChange = (e: any) => {
  const idx = e.detail.value
  form.value.province = provinces[idx]
  form.value.city = ''
  form.value.district = ''
  cityIndex.value = -1
  districtIndex.value = -1
}

const onCityChange = (e: any) => {
  const idx = e.detail.value
  form.value.city = cities.value[idx]
  form.value.district = ''
  districtIndex.value = -1
}

const onDistrictChange = (e: any) => {
  const idx = e.detail.value
  form.value.district = districts.value[idx]
}

const saveAddress = async () => {
  if (!form.value.name) {
    uni.showToast({ title: '请输入收货人', icon: 'none' })
    return
  }
  if (!form.value.phone || !/^1[3-9]\d{9}$/.test(form.value.phone)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }
  if (!form.value.province || !form.value.city || !form.value.district) {
    uni.showToast({ title: '请选择完整的省市区', icon: 'none' })
    return
  }
  if (!form.value.detail) {
    uni.showToast({ title: '请输入详细地址', icon: 'none' })
    return
  }
  
  try {
    if (form.value.id) {
      await request(`/addresses/${form.value.id}`, 'PUT', form.value)
      uni.showToast({ title: '修改成功', icon: 'none' })
    } else {
      await request('/addresses', 'POST', form.value)
      uni.showToast({ title: '添加成功', icon: 'none' })
    }
    setTimeout(() => uni.navigateBack(), 1000)
  } catch (e: any) {
    uni.showToast({ title: e.error || '保存失败', icon: 'none' })
  }
}
</script>
<style lang="scss" scoped>
.address-form { padding: 24rpx; background: #f5f5f5; min-height: 100vh; }
.form-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 28rpx;
  margin-bottom: 16rpx;
  .label { font-size: 28rpx; color: #666; display: block; margin-bottom: 16rpx; }
  input { font-size: 30rpx; color: #333; }
}
.picker-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 30rpx;
  color: #333;
  .arrow { color: #ccc; font-size: 32rpx; }
}
.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .label { margin-bottom: 0; }
}
.save-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ff5777, #ff8a9a);
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  border: none;
  margin-top: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
