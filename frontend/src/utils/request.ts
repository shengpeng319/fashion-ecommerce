// #ifdef H5
// H5 开发模式：通过 Vite proxy 走相对路径
const BASE = '/api/fashions'
// #endif

// #ifndef H5
// 微信小程序：使用环境变量配置的实际后端地址
// 小程序后台需在「开发管理」→「开发设置」中添加合法域名」
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api/fashions'
// #endif

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
