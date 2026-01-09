/**
 * 通用工具函数
 */

/**
 * 生成 0 到 n 的随机整数（包含 0 和 n）
 * @param {number} n - 最大值
 * @returns {number} 随机整数
 */
export function getRandomInt(n) {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('n 必须是非负整数');
  }
  return Math.floor(Math.random() * (n + 1));
}

/**
 * 获取周几的中文
 * @param {string|Date} date - 日期
 * @returns {string} 周几
 */
export function getWeekday(date) {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[new Date(date).getDay()];
}

/**
 * 格式化日期
 * @param {string|Date} dateStr - 日期
 * @param {boolean} withTime - 是否包含时间
 * @returns {string} 格式化后的日期 YYYY.MM.DD 或 YYYY.MM.DD HH:mm
 */
export function formatDate(dateStr, withTime = false) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (withTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }

  return `${year}.${month}.${day}`;
}

/**
 * 格式化日期（横线分隔）
 * @param {string|Date} dateStr - 日期
 * @param {boolean} withTime - 是否包含时间
 * @returns {string} 格式化后的日期 YYYY-MM-DD 或 YYYY-MM-DD HH:mm
 */
export function formatDateDash(dateStr, withTime = false) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (withTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  return `${year}-${month}-${day}`;
}

/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 节流函数
 * @param {Function} fn - 要节流的函数
 * @param {number} interval - 间隔时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, interval = 300) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 深拷贝
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item));
  }

  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 生成唯一 ID
 * @returns {string} 唯一 ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * 判断是否为空（null、undefined、空字符串、空数组、空对象）
 * @param {*} value - 要判断的值
 * @returns {boolean} 是否为空
 */
export function isEmpty(value) {
  if (value === null || value === undefined || value === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  return false;
}
