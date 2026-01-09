/**
 * 枚举管理示例
 * 根据业务需要自行扩展
 *
 * @example
 * // 定义枚举
 * export const STATUS = { PENDING: 0, DONE: 1 }
 * export const STATUS_NAME = { 0: '待处理', 1: '已完成' }
 *
 * // 使用
 * const name = STATUS_NAME[STATUS.PENDING] // '待处理'
 * const options = enumToOptions(STATUS, STATUS_NAME)
 */

/**
 * 通用状态
 */
export const COMMON_STATUS = {
  DISABLED: 0,
  ENABLED: 1,
};

export const COMMON_STATUS_NAME = {
  [COMMON_STATUS.DISABLED]: '禁用',
  [COMMON_STATUS.ENABLED]: '启用',
};

/**
 * 枚举转选项数组（用于下拉框）
 * @param {Object} enumObj - 枚举对象
 * @param {Object} nameMap - 名称映射
 * @returns {Array} [{ value, label }]
 */
export function enumToOptions(enumObj, nameMap) {
  return Object.values(enumObj).map((value) => ({
    value,
    label: nameMap[value] || value,
  }));
}
