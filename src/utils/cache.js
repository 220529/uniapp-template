/**
 * 页面缓存管理工具
 */

const CACHE_PREFIX = 'page_cache_';

const generateCacheKey = (businessKey) => `${CACHE_PREFIX}${businessKey}`;

export const saveCache = (businessKey, data) => {
  try {
    const cacheKey = generateCacheKey(businessKey);
    const cacheData = {
      ...data,
      businessKey,
      timestamp: Date.now(),
    };
    uni.setStorageSync(cacheKey, cacheData);
    return true;
  } catch (error) {
    console.error(`保存缓存失败 [${businessKey}]:`, error);
    return false;
  }
};

export const getCache = (businessKey) => {
  try {
    const cacheKey = generateCacheKey(businessKey);
    const cacheData = uni.getStorageSync(cacheKey);
    if (!cacheData) {
      return null;
    }
    return cacheData;
  } catch (error) {
    console.error(`获取缓存失败 [${businessKey}]:`, error);
    return null;
  }
};

export const clearCache = (businessKey) => {
  try {
    const cacheKey = generateCacheKey(businessKey);
    uni.removeStorageSync(cacheKey);
    return true;
  } catch (error) {
    console.error(`清除缓存失败 [${businessKey}]:`, error);
    return false;
  }
};

export const pagePathToCacheKey = (pagePath) => {
  if (!pagePath) return '';
  return pagePath.replace(/^\//, '').replace(/\//g, '_');
};

const getCurrentPagePath = () => {
  try {
    if (typeof getCurrentPages === 'function') {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.route) {
        return '/' + currentPage.route;
      }
    }
    return null;
  } catch (error) {
    console.error('获取当前页面路径失败:', error);
    return null;
  }
};

export const getPageCache = (pagePath = null) => {
  const targetPagePath = pagePath || getCurrentPagePath();
  if (!targetPagePath) {
    console.warn('无法获取页面路径');
    return null;
  }
  const cacheKey = pagePathToCacheKey(targetPagePath);
  return getCache(cacheKey);
};

export const savePageCache = (pagePath = null, data) => {
  const targetPagePath = pagePath || getCurrentPagePath();
  if (!targetPagePath) {
    console.warn('无法获取页面路径');
    return false;
  }
  const cacheKey = pagePathToCacheKey(targetPagePath);
  return saveCache(cacheKey, data);
};

export const clearPageCache = (pagePath = null) => {
  const targetPagePath = pagePath || getCurrentPagePath();
  if (!targetPagePath) {
    console.warn('无法获取页面路径');
    return false;
  }
  const cacheKey = pagePathToCacheKey(targetPagePath);
  return clearCache(cacheKey);
};
