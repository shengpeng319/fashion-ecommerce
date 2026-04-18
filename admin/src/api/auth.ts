import request from './request'

export const authApi = {
  login: (data: { phone: string; password: string }) => request.post('/auth/login', data),
  register: (data: { phone: string; password: string; nickname?: string }) => request.post('/auth/register', data),
  getProfile: () => request.get('/auth/profile'),
  changePassword: (data: { oldPassword: string; newPassword: string }) => request.put('/auth/password', data)
}
