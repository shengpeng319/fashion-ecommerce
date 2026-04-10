import request from './request'

export const authApi = {
  login: (data: { phone: string; password: string }) => request.post('/auth/login', data),
  getProfile: () => request.get('/auth/profile'),
  changePassword: (data: { oldPassword: string; newPassword: string }) => request.put('/auth/password', data)
}
