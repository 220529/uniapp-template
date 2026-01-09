import http from './core/request.js';

/**
 * 用户相关接口
 */
export const userApi = {
  // 获取用户信息
  getUserInfo: (params) => http.get('/api/user/info', params),

  // 更新用户信息
  updateUserInfo: (data) => http.post('/api/user/update', data),

  // 登录
  login: (data) => http.post('/api/user/login', data),

  // 登出
  logout: () => http.post('/api/user/logout'),
};
