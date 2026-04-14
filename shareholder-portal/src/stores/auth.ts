import { ref, computed } from 'vue'

export interface ShareholderInfo {
  id: number
  name: string
  phone: string
  level: string
  investmentAmount: number
}

const token = ref<string>(localStorage.getItem('shareholder_token') || '')
const shareholderInfo = ref<ShareholderInfo | null>(null)

export function useAuthStore() {
  const isLoggedIn = computed(() => !!token.value)

  const setAuth = (newToken: string, data?: ShareholderInfo) => {
    token.value = newToken
    localStorage.setItem('shareholder_token', newToken)
    if (data) {
      shareholderInfo.value = data
      localStorage.setItem('shareholder_info', JSON.stringify(data))
    }
  }

  const loadFromStorage = () => {
    const stored = localStorage.getItem('shareholder_info')
    if (stored) {
      shareholderInfo.value = JSON.parse(stored)
    }
  }

  const logout = () => {
    token.value = ''
    shareholderInfo.value = null
    localStorage.removeItem('shareholder_token')
    localStorage.removeItem('shareholder_info')
  }

  return {
    token,
    shareholder: shareholderInfo,
    isLoggedIn,
    setAuth,
    loadFromStorage,
    logout
  }
}
