<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
onLaunch(() => {
  // #ifdef MP-WEIXIN
  wx.cloud.init({ env: 'prod-d2gwfmcsv098ff7b1' })
  // #endif
  console.log('App Launch')
})
onShow(() => { console.log('App Show') })
onHide(() => { console.log('App Hide') })
</script>
<style lang="scss">
@import '@/styles/common.scss';
</style>
