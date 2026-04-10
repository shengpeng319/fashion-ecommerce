import request from './request'

export const userApi = {
  list: (params: any) => request.get('/users', { params }),
  get: (id: string) => request.get(`/users/${id}`)
}
