import request from './request'

export const orderApi = {
  list: (params: any) => request.get('/orders', { params }),
  get: (id: string) => request.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => request.put(`/orders/${id}/status`, { status })
}
