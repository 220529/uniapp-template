/**
 * 事件总线 - 基于 uni 事件系统的轻量封装
 * 用于跨组件/跨页面通信
 *
 * @example
 * // 监听事件
 * eventBus.on('user-login', (data) => console.log(data))
 *
 * // 触发事件
 * eventBus.emit('user-login', { userId: 123 })
 *
 * // 移除监听（组件卸载时调用）
 * eventBus.off('user-login', callback)
 */
class EventBus {
  /**
   * 监听事件
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(eventName, callback) {
    uni.$on(eventName, callback);
  }

  /**
   * 监听一次性事件（触发后自动移除）
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   */
  once(eventName, callback) {
    uni.$once(eventName, callback);
  }

  /**
   * 移除事件监听
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数（可选，不传则移除该事件所有监听）
   */
  off(eventName, callback) {
    uni.$off(eventName, callback);
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {*} data - 传递的数据
   */
  emit(eventName, data) {
    uni.$emit(eventName, data);
  }
}

export const eventBus = new EventBus();

/**
 * 预定义事件名称（根据业务需要扩展）
 * 使用常量避免拼写错误
 */
export const EVENT_NAMES = {
  // 用户相关
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_INFO_UPDATED: 'USER_INFO_UPDATED',

  // 数据刷新
  DATA_REFRESH: 'DATA_REFRESH',
  LIST_REFRESH: 'LIST_REFRESH',

  // 示例：根据业务扩展
  // ORDER_CREATED: 'ORDER_CREATED',
  // CART_UPDATED: 'CART_UPDATED',
};
