import axios from 'axios'

const api = axios.create({
  baseURL: '/api/shareholder',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('shareholder_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response.data,
  error => {
    const msg = error.response?.data?.error || error.response?.data?.message || '请求失败'
    return Promise.reject(new Error(msg))
  }
)

export interface LoginReq {
  phone: string
  password: string
}

export interface RegisterReq {
  phone: string
  password: string
}

export interface LoginResp {
  token: string
  shareholder: {
    id: number
    name: string
    phone: string
    level: number
    investmentAmount: number
  }
}

export interface DashboardResp {
  name: string
  level: string
  totalInvestment: number
  cumulativeReturns: number
  pendingDividends: number
  investmentRatio: number
  recentInvestments: InvestmentItem[]
}

export interface InvestmentItem {
  id: number
  date: string
  type: 'initial' | 'additional' | 'withdrawal'
  amount: number
  note: string
}

export interface DividendItem {
  id: number
  period: string
  amount: number
  status: 'paid' | 'pending'
}

export const shareholderApi = {
  login: (data: LoginReq) => api.post<LoginResp>('/login', data),
  register: (data: RegisterReq) => api.post<{success: boolean; data: {token: string; userId: number; phone: string}}>('/register', data),
  getDashboard: () => api.get<DashboardResp>('/dashboard/me'),
  getInvestments: () => api.get<InvestmentItem[]>('/me/investments'),
  getDividends: () => api.get<DividendItem[]>('/me/dividends')
}

export default api
