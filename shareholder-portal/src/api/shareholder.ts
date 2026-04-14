import axios from 'axios'

const baseURL = 'http://192.168.101.50:8083/api/shareholder'

const api = axios.create({
  baseURL,
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

export interface LoginReq {
  phone: string
  password: string
}

export interface LoginResp {
  token: string
  shareholder: {
    id: number
    name: string
    phone: string
    level: string
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
  
  getDashboard: () => api.get<DashboardResp>('/dashboard/me'),
  
  getInvestments: () => api.get<InvestmentItem[]>('/me/investments'),
  
  getDividends: () => api.get<DividendItem[]>('/me/dividends')
}

export default api
