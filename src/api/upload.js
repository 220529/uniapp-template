/**
 * 文件上传 API
 * 支持单文件上传、批量上传、进度回调
 */

import { http } from './core/request.js';
import { requestInterceptor } from './core/interceptors.js';

// Loading 计数器
let loadingCount = 0;

const showLoading = (title = '上传中...') => {
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
const showError = (message) => {
  const now = Date.now();
  if (now - lastErrorTime > 1500) {
    uni.showToast({ title: message, icon: 'error', duration: 3000 });
    lastErrorTime = now;
  }
};

/**
 * 文件上传核心方法
 * @param {Object} options - 上传选项
 * @param {string} options.filePath - 文件路径
 * @param {string} options.url - 上传接口地址
 * @param {string} options.name - 文件字段名
 * @param {Object} options.formData - 额外表单数据
 * @param {boolean} options.loading - 是否显示 loading
 * @param {string} options.loadingText - loading 文字
 * @param {boolean} options.showError - 是否显示错误提示
 * @param {Function} options.onProgress - 进度回调
 * @param {number} options.timeout - 超时时间
 * @returns {Promise} 上传结果
 */
const uploadFile = (options) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 使用请求拦截器处理通用配置
      const processedOptions = await requestInterceptor({
        url: options.url || '/api/upload',
        method: 'POST',
      });

      const uploadOptions = {
        url: processedOptions.url,
        filePath: options.filePath,
        name: options.name || 'file',
        header: processedOptions.header,
        timeout: options.timeout || 30000,
        formData: options.formData || {},
      };

      // 显示 loading
      if (options.loading !== false) {
        showLoading(options.loadingText || '上传中...');
      }

      const uploadTask = uni.uploadFile({
        ...uploadOptions,
        success: (res) => {
          if (options.loading !== false) hideLoading();

          if (res.statusCode !== 200) {
            const error = new Error(`HTTP 状态码异常: ${res.statusCode}`);
            if (options.showError !== false) showError(error.message);
            return reject(error);
          }

          let data;
          try {
            data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          } catch (e) {
            const error = new Error('响应不是有效 JSON');
            if (options.showError !== false) showError(error.message);
            return reject(error);
          }

          // 兼容 0/200 两种成功码
          if ([0, 200].includes(data?.code)) {
            resolve({
              code: 0,
              data: data.data || data.url,
              msg: 'success',
              raw: res,
            });
          } else {
            const error = new Error(data.msg || `业务错误: ${data.code}`);
            if (options.showError !== false) showError(error.message);
            reject(error);
          }
        },
        fail: (err) => {
          if (options.loading !== false) hideLoading();

          const errorMsg = err.errMsg?.includes('timeout') ? '上传超时' : '网络错误';
          const error = new Error(errorMsg);
          if (options.showError !== false) showError(error.message);
          reject(error);
        },
      });

      // 进度回调
      if (options.onProgress && typeof options.onProgress === 'function') {
        uploadTask.onProgressUpdate(options.onProgress);
      }
    } catch (error) {
      if (options.loading !== false) hideLoading();

      const errorResult = new Error('上传请求配置错误');
      if (options.showError !== false) showError(errorResult.message);
      reject(errorResult);
    }
  });
};

/**
 * 上传相关接口
 */
export const uploadApi = {
  /**
   * 单文件上传
   * @param {string} filePath - 文件路径
   * @param {Object} options - 上传选项
   */
  upload: (filePath, options = {}) => {
    return uploadFile({ filePath, ...options });
  },

  /**
   * 批量文件上传（支持并发控制）
   * @param {Array} files - 文件数组 [{ filePath, ... }]
   * @param {Object} options - 上传选项
   * @param {number} options.concurrency - 并发数，默认 3
   * @param {Function} options.onProgress - 单个文件进度回调 (index, progress)
   * @param {Function} options.onFileComplete - 单个文件完成回调 (index, result)
   */
  uploadBatch: async (files, options = {}) => {
    const { concurrency = 3, onFileComplete, ...otherOptions } = options;
    const results = [];
    const errors = [];

    // 分批处理，控制并发数
    for (let i = 0; i < files.length; i += concurrency) {
      const batch = files.slice(i, i + concurrency);

      const batchPromises = batch.map(async (file, batchIndex) => {
        const globalIndex = i + batchIndex;
        try {
          const result = await uploadFile({
            filePath: file.filePath || file.url || file,
            onProgress: (progress) => {
              options.onProgress?.(globalIndex, progress);
            },
            loadingText: `上传中 ${globalIndex + 1}/${files.length}`,
            ...otherOptions,
          });

          onFileComplete?.(globalIndex, { success: true, result });
          return { index: globalIndex, result, file };
        } catch (error) {
          onFileComplete?.(globalIndex, { success: false, error });
          return { index: globalIndex, error, file };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { index, result: uploadResult, error, file } = result.value;
          if (error) {
            errors.push({ index, error, file });
          } else {
            results.push({ index, result: uploadResult, file });
          }
        }
      });
    }

    return {
      success: results,
      failed: errors,
      total: files.length,
      successCount: results.length,
      failedCount: errors.length,
    };
  },
};

export default uploadApi;
