import request from './request'

export const productApi = {
  list: (params: any) => request.get('/products', { params }),
  get: (id: string) => request.get(`/products/${id}`),
  create: (data: any) => request.post('/products', data),
  update: (id: string, data: any) => request.put(`/products/${id}`, data),
  delete: (id: string) => request.delete(`/products/${id}`),
  upload: (formData: FormData) => request.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}
