/**
 * 轻量级状态管理
 * 基于 Vue3 reactive，无需额外依赖
 */

import { reactive } from 'vue';
import { tokenManager } from '@/auth/tokenManager.js';

// 全局状态
export const store = reactive({
  // 登录状态
  isLoggedIn: false,
  // 用户信息
  userInfo: null,
});

/**
 * 登录 - 保存用户信息
 * @param {Object} userInfo - 用户信息
 */
export const login = (userInfo) => {
  store.isLoggedIn = true;
  store.userInfo = { ...userInfo };

  // 持久化到本地存储
  uni.setStorageSync('userInfo', store.userInfo);
  uni.setStorageSync('isLoggedIn', true);
};

/**
 * 登出 - 清除用户信息
 */
export const logout = () => {
  store.isLoggedIn = false;
  store.userInfo = null;

  // 清除本地存储
  uni.removeStorageSync('userInfo');
  uni.removeStorageSync('isLoggedIn');

  // 清除 Token
  tokenManager.clearToken();
};

/**
 * 更新用户信息
 * @param {Object} info - 要更新的信息
 */
export const updateUserInfo = (info) => {
  if (store.userInfo) {
    store.userInfo = { ...store.userInfo, ...info };
    uni.setStorageSync('userInfo', store.userInfo);
  }
};

/**
 * 检查是否在登录页面
 */
const isOnLoginPage = () => {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1];
    return currentPage.route?.includes('login');
  }
  return false;
};

/**
 * 初始化状态（从本地存储恢复）
 * 在 App.vue 的 onLaunch 中调用
 */
export const initStore = () => {
  const savedUserInfo = uni.getStorageSync('userInfo');
  const savedIsLoggedIn = uni.getStorageSync('isLoggedIn');

  if (savedIsLoggedIn && savedUserInfo) {
    store.isLoggedIn = true;
    store.userInfo = savedUserInfo;

    // 如果在登录页面，跳过 Token 检查
    if (isOnLoginPage()) {
      return;
    }

    // 延迟检查 Token 有效性
    setTimeout(() => {
      if (isOnLoginPage()) return;

      // Token 无效则静默登出
      if (!tokenManager.isLoggedIn()) {
        console.log('Token 已过期，清除登录状态');
        logout();
      }
    }, 3000);
  }
};

export default {
  store,
  login,
  logout,
  updateUserInfo,
  initStore,
};
