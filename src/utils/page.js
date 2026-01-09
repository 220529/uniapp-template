/**
 * 页面工具 - 缓存传参 & 跳转
 * 解决小程序 URL 参数长度限制（约 2KB）
 */

const CACHE_PREFIX = 'page_cache_';

// ==================== 内部方法 ====================

const getCurrentPath = () => {
  try {
    const pages = getCurrentPages();
    const page = pages[pages.length - 1];
    return page?.route ? '/' + page.route : null;
  } catch {
    return null;
  }
};

const pathToKey = (path) => path?.replace(/^\//, '').replace(/\//g, '_') || '';

const doNavigate = (url, type = 'navigate') => {
  const methods = {
    navigate: () => uni.navigateTo({ url }),
    redirect: () => uni.redirectTo({ url }),
    reLaunch: () => uni.reLaunch({ url }),
    switchTab: () => uni.switchTab({ url }),
  };
  (methods[type] || methods.navigate)();
};

// ==================== 缓存操作 ====================

/**
 * 保存页面缓存
 */
export const savePageCache = (pagePath, data) => {
  const path = pagePath || getCurrentPath();
  if (!path) return false;
  try {
    uni.setStorageSync(`${CACHE_PREFIX}${pathToKey(path)}`, { ...data, _ts: Date.now() });
    return true;
  } catch {
    return false;
  }
};

/**
 * 获取页面缓存
 */
export const getPageCache = (pagePath = null) => {
  const path = pagePath || getCurrentPath();
  if (!path) return null;
  try {
    return uni.getStorageSync(`${CACHE_PREFIX}${pathToKey(path)}`) || null;
  } catch {
    return null;
  }
};

/**
 * 清除页面缓存
 */
export const clearPageCache = (pagePath = null) => {
  const path = pagePath || getCurrentPath();
  if (!path) return false;
  try {
    uni.removeStorageSync(`${CACHE_PREFIX}${pathToKey(path)}`);
    return true;
  } catch {
    return false;
  }
};

// ==================== 页面跳转 ====================

/**
 * 带缓存跳转（推荐，适合大数据）
 *
 * @example
 * // 跳转并传递数据
 * navigateTo('/pages/detail/index', { id: 1, list: [...] })
 *
 * // 目标页面获取
 * const data = getPageCache()
 * clearPageCache() // 用完清理
 */
export const navigateTo = (url, data = {}, type = 'navigate') => {
  if (!url) return;
  if (Object.keys(data).length > 0) {
    savePageCache(url, data);
  }
  doNavigate(url, type);
};

/**
 * 带 URL 参数跳转（适合小数据）
 *
 * @example
 * navigateWithParams('/pages/detail/index', { id: 1 })
 *
 * // 目标页面获取
 * const { id } = getUrlParams()
 */
export const navigateWithParams = (url, params = {}, type = 'navigate') => {
  if (!url) return;
  let fullUrl = url;
  if (Object.keys(params).length > 0) {
    fullUrl = `${url}?params=${encodeURIComponent(JSON.stringify(params))}`;
  }
  doNavigate(fullUrl, type);
};

/**
 * 获取 URL 参数
 */
export const getUrlParams = () => {
  try {
    const pages = getCurrentPages();
    const encoded = pages[pages.length - 1]?.options?.params;
    return encoded ? JSON.parse(decodeURIComponent(encoded)) : null;
  } catch {
    return null;
  }
};
