import request from './request'

const base = '/api/shareholder'

export const shareholderApi = {
  // 配置
  getConfig: (): Promise<any[]> => request.get(`${base}/config`),
  updateConfig: (configs: any[]) => request.put(`${base}/config`, { configs }),

  // 列表
  list: (): Promise<any[]> => request.get(`${base}/list`),
  
  // 创建
  create: (data: any) => request.post(`${base}`, data),

  // 详情
  get: (id: string): Promise<any> => request.get(`${base}/${id}`),

  // 投资记录
  getInvestments: (id: string): Promise<any[]> => request.get(`${base}/${id}/investments`),
  addInvestment: (id: string, data: any) => request.post(`${base}/${id}/investments`, data),

  // 分红记录
  getDividends: (id: string): Promise<any[]> => request.get(`${base}/${id}/dividends`),
  addDividend: (id: string, data: any) => request.post(`${base}/${id}/dividends`, data),

  // 成本分摊
  getCosts: (id: string): Promise<any[]> => request.get(`${base}/${id}/costs`),
  addCost: (id: string, data: any) => request.post(`${base}/${id}/costs`, data),

  // Dashboard
  getDashboard: (): Promise<any> => request.get(`${base}/dashboard/me`),
}
