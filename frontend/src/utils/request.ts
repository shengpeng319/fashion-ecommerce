// H5: 使用 HTTP 请求
// 微信小程序: 使用 wx.cloud.callContainer（免域名配置）
const CLOUD_ENV = 'prod-d2gwfmcsv098ff7b1'
const CLOUD_SERVICE = 'fashions-api'
const H5_BASE = import.meta.env.VITE_API_BASE || 'https://fashions-api-267246-4-1440883791.sh.run.tcloudbase.com/api/fashions'

export const request = (url: string, method: string = 'GET', data: any = null) => {
  return new Promise((resolve, reject) => {
    const header: any = {
      'Content-Type': 'application/json',
      'Authorization': uni.getStorageSync('token') ? `Bearer ${uni.getStorageSync('token')}` : ''
    }

    const handleResponse = (res: any) => {
      if (res.statusCode === 200) {
        resolve(res.data)
      } else if (res.statusCode === 401) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        reject(res.data)
      } else {
        uni.showToast({ title: res.data?.error || '请求失败', icon: 'none' })
        reject(res.data)
      }
    }

    const handleFail = (err: any) => {
      console.error('Request failed:', err)
      uni.showToast({ title: '网络错误', icon: 'none' })
      reject(err)
    }

    // #ifdef MP-WEIXIN
    wx.cloud.callContainer({
      config: { env: CLOUD_ENV },
      path: '/api/fashions' + url,
      method,
      data,
      header: { ...header, 'X-WX-SERVICE': CLOUD_SERVICE },
      success: handleResponse,
      fail: handleFail
    })
    // #endif

    // #ifdef H5
    uni.request({
      url: H5_BASE + url,
      method,
      data,
      header,
      success: handleResponse,
      fail: handleFail
    })
    // #endif
  })
}

export const getToken = () => uni.getStorageSync('token')
export const setToken = (token: string) => uni.setStorageSync('token', token)
export const clearToken = () => uni.removeStorageSync('token')
