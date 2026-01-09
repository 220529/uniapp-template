// 有效的环境类型
const VALID_ENV_TYPES = ['dev', 'prod', 'local'];
const STORAGE_KEY = 'APP_ENV_TYPE';

// 验证环境类型是否有效
function isValidEnvType(envType) {
  return typeof envType === 'string' && VALID_ENV_TYPES.includes(envType);
}

// 判断是否为线上正式版本
function isReleaseVersion() {
  // #ifdef MP-WEIXIN
  try {
    if (typeof wx !== 'undefined' && wx.getAccountInfoSync) {
      const accountInfo = wx.getAccountInfoSync();
      return accountInfo.miniProgram?.envVersion === 'release';
    }
  } catch (error) {
    console.warn('[ENV] 获取小程序版本失败:', error);
  }
  // #endif
  return false;
}

// 初始化环境设置
function initializeEnvInStorage() {
  try {
    if (typeof uni === 'undefined') {
      throw new Error('[ENV] uni 对象不可用');
    }

    // 线上版本：完全不使用 storage，清空残留配置
    if (isReleaseVersion()) {
      try {
        uni.removeStorageSync(STORAGE_KEY);
      } catch (error) {
        // 静默失败
      }
      return 'prod';
    }

    // 体验版/开发版：优先使用 storage
    const storageEnv = uni.getStorageSync(STORAGE_KEY);
    if (isValidEnvType(storageEnv)) {
      return storageEnv;
    }

    // storage 为空，使用构建时的环境变量
    const defaultEnv = import.meta.env.VITE_DEFAULT_ENV;
    if (!defaultEnv || !isValidEnvType(defaultEnv)) {
      throw new Error(`[ENV] 无效的环境配置: ${defaultEnv}`);
    }

    uni.setStorageSync(STORAGE_KEY, defaultEnv);
    return defaultEnv;
  } catch (error) {
    console.error('[ENV] 初始化失败:', error);
    throw error;
  }
}

// 获取当前环境类型
function getCurrentEnvType() {
  if (typeof uni === 'undefined') {
    throw new Error('[ENV] uni 对象不可用');
  }

  if (isReleaseVersion()) {
    return 'prod';
  }

  const storageEnv = uni.getStorageSync(STORAGE_KEY);
  if (isValidEnvType(storageEnv)) {
    return storageEnv;
  }

  return initializeEnvInStorage();
}

// 动态获取配置
function getConfig() {
  const envType = getCurrentEnvType();
  const prefix = envType.toUpperCase();
  return {
    API_BASE_URL: import.meta.env[`VITE_${prefix}_API_BASE_URL`],
    TENANT_ID: import.meta.env.VITE_TENANT_ID,
    LOGIN_USER_TYPE: import.meta.env.VITE_LOGIN_USER_TYPE,
    APP_NAME: import.meta.env.VITE_APP_NAME,
    ENV_TYPE: envType,
  };
}

export function getAPIBaseURL() {
  return getConfig().API_BASE_URL;
}

export function getTenantID() {
  return getConfig().TENANT_ID;
}

export function getLoginUserType() {
  return getConfig().LOGIN_USER_TYPE;
}

// 环境切换功能
export function switchEnv(envType) {
  if (!isValidEnvType(envType)) {
    console.error(`[ENV] 无效的环境类型: ${envType}`);
    return false;
  }

  const currentEnv = getCurrentEnvType();
  if (currentEnv === envType) {
    return true;
  }

  uni.setStorageSync(STORAGE_KEY, envType);
  console.log(`[ENV] 环境已切换: ${currentEnv} -> ${envType}`);
  return true;
}

// 获取当前环境信息
export function getCurrentEnvInfo() {
  const envType = getCurrentEnvType();
  const envNames = {
    dev: '测试环境',
    prod: '生产环境',
    local: '本地环境',
  };
  return {
    type: envType,
    name: envNames[envType] || '未知环境',
    isDev: envType === 'dev',
    isProd: envType === 'prod',
    isLocal: envType === 'local',
    canSwitch: !isReleaseVersion(),
  };
}

export const isDev = import.meta.env.MODE === 'development';
export const isProd = import.meta.env.MODE === 'production';

// 环境信息检测
setTimeout(() => {
  try {
    const currentEnv = getCurrentEnvType();
    const isRelease = isReleaseVersion();

    console.log('[ENV] ============ 环境信息 ============');
    console.log(`[ENV] 版本类型: ${isRelease ? '🔒 线上版本' : '🔓 体验版/开发版'}`);
    console.log(`[ENV] 当前环境: ${currentEnv}`);
    console.log(`[ENV] API地址: ${getConfig().API_BASE_URL}`);
    console.log('[ENV] ===================================');
  } catch (error) {
    console.error('[ENV] 环境检测失败:', error);
  }
}, 100);

// 暴露到全局
setTimeout(() => {
  try {
    if (typeof globalThis !== 'undefined') {
      globalThis.switchEnv = switchEnv;
    }
  } catch (error) {
    console.error('[ENV] 全局函数注册失败:', error);
  }
}, 500);

export default getConfig;
