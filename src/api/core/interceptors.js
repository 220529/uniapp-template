import { getAPIBaseURL, getTenantID, getLoginUserType } from '@/utils/env.js';
import { tokenManager } from '@/auth/tokenManager.js';

/**
 * 请求拦截器
 */
export const requestInterceptor = async (options) => {
  if (!options.method) {
    options.method = 'GET';
  }

  if (!options.url.startsWith('http')) {
    options.url = getAPIBaseURL() + options.url;
  }

  options.header = {
    'tenant-id': getTenantID() || '1',
    login_user_type: getLoginUserType() || '3',
    'Content-Type': 'application/json',
    ...options.header,
  };

  // 跳过登录页和刷新token接口的token检查
  if (isSkipTokenCheck(options.url)) {
    return options;
  }

  try {
    const token = await tokenManager.getValidToken();
    if (token) {
      options.header.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('Token获取失败:', error.message);
  }

  return options;
};

/**
 * 响应拦截器
 */
export const responseInterceptor = async (response) => {
  const { statusCode, data } = response;

  if (statusCode < 200 || statusCode >= 300) {
    if (statusCode === 401) {
      return handleUnauthorized(response.config);
    }
    return createErrorResponse(statusCode, getHttpErrorMessage(statusCode));
  }

  if (data && typeof data.code !== 'undefined') {
    if (data.code === 0) {
      return data;
    } else if (data.code === 401) {
      return handleUnauthorized(response.config);
    }
    return createErrorResponse(data.code, data.msg || data.message);
  }

  return data;
};

async function handleUnauthorized(requestConfig) {
  const refreshToken = tokenManager.getRefreshToken();

  if (!refreshToken || !tokenManager.config.enableAutoRefresh) {
    tokenManager._safeRedirectToLogin();
    const error = new Error('未授权，请重新登录');
    error.silent = true;
    throw error;
  }

  try {
    if (tokenManager.refreshPromise) {
      const newConfig = await tokenManager.addToQueue(requestConfig);
      return { code: 'TOKEN_REFRESHED', config: newConfig };
    }

    await tokenManager.refreshToken();
    return {
      code: 'TOKEN_REFRESHED',
      config: { ...requestConfig, _tokenRefreshed: true },
    };
  } catch (error) {
    tokenManager._safeRedirectToLogin();
    const silentError = new Error('登录已过期，请重新登录');
    silentError.silent = true;
    throw silentError;
  }
}

function isSkipTokenCheck(url) {
  const skipUrls = ['/login', '/refresh-token'];
  return skipUrls.some((skipUrl) => url.includes(skipUrl));
}

function createErrorResponse(code, message) {
  return {
    success: false,
    code,
    message,
    data: null,
  };
}

function getHttpErrorMessage(statusCode) {
  const errorMessages = {
    401: '未授权，请重新登录',
    403: '拒绝访问',
    404: '请求地址不存在',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时',
  };
  return errorMessages[statusCode] || '网络请求失败';
}
