const BASE = 'http://192.168.101.50:3001/api/fashions'

export const request = (url: string, method: string = 'GET', data: any = null) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': uni.getStorageSync('token') ? `Bearer ${uni.getStorageSync('token')}` : ''
      },
      success: (res: any) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          uni.showToast({ title: '请先登录', icon: 'none' })
          reject(res.data)
        } else {
          uni.showToast({ title: res.data?.error || '请求失败', icon: 'none' })
          reject(res.data)
        }
      },
      fail: (err: any) => {
        uni.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      }
    })
  })
}

export const getToken = () => uni.getStorageSync('token')
export const setToken = (token: string) => uni.setStorageSync('token', token)
export const clearToken = () => uni.removeStorageSync('token')
