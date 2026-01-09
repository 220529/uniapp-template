/**
 * 文件操作工具
 * 图片预览、PDF 预览、文件类型检测
 */

/**
 * 文件类型枚举
 */
export const FILE_TYPES = {
  IMAGE: 'image',
  PDF: 'pdf',
  VIDEO: 'video',
  UNKNOWN: 'unknown',
};

/**
 * 文件扩展名映射
 */
const FILE_EXTENSIONS = {
  image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  pdf: ['.pdf'],
  video: ['.mp4', '.mov', '.avi'],
};

/**
 * 检测文件类型
 * @param {string} url - 文件 URL
 * @returns {string} 文件类型
 */
export function detectFileType(url) {
  if (!url) return FILE_TYPES.UNKNOWN;

  try {
    const ext = url.toLowerCase().split('?')[0].match(/\.[^.]+$/)?.[0];
    for (const [type, extensions] of Object.entries(FILE_EXTENSIONS)) {
      if (extensions.includes(ext)) return type;
    }
    return FILE_TYPES.UNKNOWN;
  } catch {
    return FILE_TYPES.UNKNOWN;
  }
}

/**
 * 预览图片
 * @param {string|string[]} urls - 图片 URL
 * @param {string} current - 当前图片
 */
export function previewImage(urls, current = '') {
  const imageUrls = Array.isArray(urls) ? urls : [urls];
  const validUrls = imageUrls.filter((url) => url);

  if (validUrls.length === 0) {
    uni.showToast({ title: '暂无图片', icon: 'none' });
    return;
  }

  uni.previewImage({
    urls: validUrls,
    current: current || validUrls[0],
  });
}

/**
 * 预览 PDF
 * @param {string} url - PDF URL
 */
export function previewPdf(url) {
  if (!url) {
    uni.showToast({ title: '无效的文件地址', icon: 'none' });
    return;
  }

  // #ifdef MP-WEIXIN || APP-PLUS
  uni.showLoading({ title: '加载中' });

  uni.downloadFile({
    url: encodeURI(url),
    timeout: 30000,
    success: (res) => {
      const filePath = res.tempFilePath;
      if (!filePath) {
        uni.showToast({ title: '下载失败', icon: 'none' });
        return;
      }

      uni.openDocument({
        filePath,
        fileType: 'pdf',
        showMenu: true,
        fail: () => uni.showToast({ title: '打开失败', icon: 'none' }),
        complete: () => uni.hideLoading(),
      });
    },
    fail: () => {
      uni.hideLoading();
      uni.showToast({ title: '下载失败', icon: 'none' });
    },
  });
  // #endif

  // #ifdef H5
  window.open(encodeURI(url), '_blank');
  // #endif
}

export default {
  FILE_TYPES,
  detectFileType,
  previewImage,
  previewPdf,
};
