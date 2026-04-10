import request from './request'

export const categoryApi = {
  list: () => request.get('/categories'),
  create: (data: any) => request.post('/categories', data),
  update: (id: string, data: any) => request.put(`/categories/${id}`, data),
  delete: (id: string) => request.delete(`/categories/${id}`)
}
