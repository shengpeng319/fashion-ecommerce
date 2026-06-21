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
/* H5: Load Inter font from Google Fonts */
/* #ifdef H5 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
/* #endif */

@import '@/styles/common.scss';
</style>
