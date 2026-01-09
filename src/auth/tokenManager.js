import { AUTO_REFRESH_ENABLED, BUFFER_TIME, REDIRECT_DELAY } from '@/config/token.js';

/**
 * Token管理类
 */
class TokenManager {
  constructor() {
    this.refreshPromise = null;
    this.pendingQueue = [];
    this.redirecting = false;
    this.config = {
      enableAutoRefresh: AUTO_REFRESH_ENABLED,
      bufferTime: BUFFER_TIME,
      redirectDelay: REDIRECT_DELAY,
    };
  }

  configure(options = {}) {
    this.config = { ...this.config, ...options };
    return this;
  }

  setAutoRefresh(enabled) {
    this.config.enableAutoRefresh = enabled;
    return this;
  }

  async getValidToken() {
    const token = this.getToken();
    if (!token) return null;

    if (this.isOnLoginPage() || !this.config.enableAutoRefresh) {
      return this.isTokenExpired() ? null : token;
    }

    if (this.isTokenExpiringSoon()) {
      try {
        await this.refreshToken();
        return this.getToken();
      } catch (error) {
        return null;
      }
    }

    return token;
  }

  isTokenExpiringSoon() {
    const expiresTime = this.getExpiresTime();
    if (!expiresTime) return true;
    return Date.now() >= expiresTime - this.config.bufferTime;
  }

  isOnLoginPage() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    return currentPage?.route?.includes('login') || false;
  }

  getToken() {
    return uni.getStorageSync('token');
  }

  getRefreshToken() {
    return uni.getStorageSync('refreshToken');
  }

  getExpiresTime() {
    return uni.getStorageSync('expiresTime');
  }

  saveToken(tokenData) {
    const { userId, accessToken, refreshToken, expiresTime } = tokenData;
    uni.setStorageSync('token', accessToken);
    uni.setStorageSync('refreshToken', refreshToken);
    uni.setStorageSync('expiresTime', expiresTime);
    uni.setStorageSync('userId', userId);
  }

  clearToken() {
    uni.removeStorageSync('token');
    uni.removeStorageSync('refreshToken');
    uni.removeStorageSync('expiresTime');
    uni.removeStorageSync('userId');
  }

  isTokenExpired() {
    const expiresTime = this.getExpiresTime();
    if (!expiresTime) return true;
    return Date.now() >= expiresTime;
  }

  async refreshToken() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();

    try {
      const result = await this.refreshPromise;
      this._processPendingQueue(null, result);
      return result;
    } catch (error) {
      this._processPendingQueue(error, null);
      throw error;
    } finally {
      this.refreshPromise = null;
    }
  }

  async _performRefresh() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // 这里需要调用刷新接口
      // const response = await authAPI.refreshToken(refreshToken);
      // this.saveToken(response.data);
      console.log('Token刷新成功');
      return {};
    } catch (error) {
      console.error('Token刷新失败:', error);
      this.clearToken();
      this._safeRedirectToLogin();
      throw error;
    }
  }

  addToQueue(requestConfig) {
    return new Promise((resolve, reject) => {
      this.pendingQueue.push({
        config: requestConfig,
        resolve,
        reject,
      });
    });
  }

  _processPendingQueue(error, tokenData) {
    this.pendingQueue.forEach(({ config, resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve({ ...config, _tokenRefreshed: true });
      }
    });
    this.pendingQueue = [];
  }

  _safeRedirectToLogin() {
    if (this.redirecting) return;

    this.redirecting = true;

    setTimeout(() => {
      this.redirecting = false;
    }, this.config.redirectDelay);

    if (!this.isOnLoginPage()) {
      console.log('跳转到登录页...');
      uni.reLaunch({
        url: '/pages/login/index',
        fail: (error) => {
          console.error('跳转登录页失败:', error);
          this.redirecting = false;
        },
      });
    }
  }

  isLoggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  async checkOnAppResume() {
    if (this.isOnLoginPage() || !this.getToken()) {
      return true;
    }

    const needsRefresh = this.isTokenExpired() || this.isTokenExpiringSoon();

    if (needsRefresh && this.config.enableAutoRefresh) {
      try {
        await this.refreshToken();
        return true;
      } catch (error) {
        return false;
      }
    }

    return true;
  }

  destroy() {
    this.pendingQueue = [];
    this.refreshPromise = null;
    this.redirecting = false;
  }
}

export const tokenManager = new TokenManager();
