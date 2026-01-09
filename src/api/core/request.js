import { requestInterceptor, responseInterceptor } from './interceptors.js';

// 存储所有进行中的请求
const requestTaskMap = new Map();
const pendingRequests = new Set();

// loading 计数器
let loadingCount = 0;
const showLoading = (title = '加载中...') => {
  if (loadingCount === 0) {
    uni.showLoading({ title, mask: true });
  }
  loadingCount++;
};
const hideLoading = () => {
  loadingCount = Math.max(loadingCount - 1, 0);
  if (loadingCount === 0) {
    uni.hideLoading();
  }
};

// 错误提示节流
let lastErrorTime = 0;
let lastErrorMessage = '';
const showError = (message) => {
  const now = Date.now();
  if (lastErrorMessage === message && now - lastErrorTime <= 1500) {
    return;
  }

  uni.hideLoading();

  setTimeout(() => {
    uni.showToast({
      title: message,
      icon: 'error',
      duration: 3000,
      mask: true,
    });
  }, 50);

  lastErrorTime = now;
  lastErrorMessage = message;
};

// 生成请求key
const getSortedString = (obj) => {
  if (!obj || typeof obj !== 'object') return String(obj);
  return JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce((r, k) => ((r[k] = obj[k]), r), {})
  );
};
const generateRequestId = ({ url, method, data }) => {
  const safeMethod = (method || 'GET').toUpperCase();
  return `${safeMethod}_${url}_${getSortedString(data)}`;
};

/**
 * 取消指定请求
 */
export function cancelRequest(requestId) {
  const task = requestTaskMap.get(requestId);
  if (task) {
    task.abort();
    requestTaskMap.delete(requestId);
    console.log(`[请求取消] ${requestId}`);
  }
}

/**
 * 取消所有请求
 */
export function cancelAllRequests() {
  requestTaskMap.forEach((task, requestId) => {
    task.abort();
    console.log(`[请求取消] ${requestId}`);
  });
  requestTaskMap.clear();
}

/**
 * 取消指定 URL 的所有请求
 */
export function cancelRequestsByUrl(url) {
  const keysToDelete = [];

  requestTaskMap.forEach((task, requestId) => {
    if (requestId.includes(url)) {
      task.abort();
      keysToDelete.push(requestId);
      console.log(`[请求取消] ${requestId}`);
    }
  });

  keysToDelete.forEach((key) => requestTaskMap.delete(key));
}

/**
 * 核心请求方法
 */
const request = (options, retryCount = 0) => {
  const MAX_RETRY_COUNT = 1;
  const RETRY_DELAY = 100;

  return new Promise(async (resolve, reject) => {
    try {
      const processedOptions = await requestInterceptor(options);
      const requestId = generateRequestId(processedOptions);

      // 如果设置了 cancelPrevious，取消之前的同类请求
      if (options.cancelPrevious) {
        cancelRequest(requestId);
      }

      // 防重复请求
      if (pendingRequests.has(requestId) && !options._tokenRefreshed) {
        return;
      }
      pendingRequests.add(requestId);

      // Loading 处理
      if (options.loading !== false) {
        showLoading(options.loadingText);
      }

      // 创建 requestTask
      const requestTask = uni.request({
        ...processedOptions,
        success: async (response) => {
          try {
            requestTaskMap.delete(requestId);
            pendingRequests.delete(requestId);

            response.config = processedOptions;
            const result = await responseInterceptor(response);

            if (result?.code === 'TOKEN_REFRESHED') {
              return handleTokenRefreshRetry(result.config, retryCount, resolve, reject);
            }

            if (result && result.code === 0) {
              resolve(result);
            } else {
              if (options.showError !== false) {
                showError(result.msg || result.message || '请求失败');
              }
              reject(result);
            }
          } catch (error) {
            if (options.showError !== false && !error.silent) {
              showError(error.message || '请求处理失败');
            }
            reject(error);
          } finally {
            if (options.loading !== false) hideLoading();
          }
        },

        fail: (error) => {
          requestTaskMap.delete(requestId);
          pendingRequests.delete(requestId);

          if (options.loading !== false) hideLoading();

          // 区分取消和失败
          if (error.errMsg && error.errMsg.includes('abort')) {
            console.log(`[请求已取消] ${requestId}`);
            reject({ code: 'REQUEST_CANCELLED', message: '请求已取消' });
          } else {
            const errorResult = createNetworkError(error);
            if (options.showError !== false) {
              showError(errorResult.msg);
            }
            reject(errorResult);
          }
        },
      });

      // 保存 requestTask
      requestTaskMap.set(requestId, requestTask);
    } catch (error) {
      const errorResult = createInterceptorError(error);
      if (options.showError !== false && !error.silent) {
        showError(errorResult.msg);
      }
      reject(errorResult);
    }
  });

  async function handleTokenRefreshRetry(config, currentRetryCount, resolve, reject) {
    if (currentRetryCount >= MAX_RETRY_COUNT) {
      reject(createRequestError('重试次数超限'));
      return;
    }

    try {
      await delay(RETRY_DELAY);
      const result = await request(config, currentRetryCount + 1);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  }
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createRequestError(message) {
  return {
    code: -1,
    msg: message || '请求处理错误',
    data: null,
  };
}

function createNetworkError(error) {
  return {
    code: -1,
    msg: '网络连接失败，请检查网络设置',
    data: null,
    raw: error,
  };
}

function createInterceptorError(error) {
  return {
    code: -1,
    msg: '请求拦截器错误',
    data: null,
    raw: error,
  };
}

// 便捷方法
export const http = {
  get: (url, data = {}, options = {}) => request({ url, method: 'GET', data, ...options }),
  post: (url, data = {}, options = {}) => request({ url, method: 'POST', data, ...options }),
  put: (url, data = {}, options = {}) => request({ url, method: 'PUT', data, ...options }),
  delete: (url, data = {}, options = {}) => request({ url, method: 'DELETE', data, ...options }),
  request,
  cancelRequest,
  cancelAllRequests,
  cancelRequestsByUrl,
};

export default http;
