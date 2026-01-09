<script>
import { initStore } from '@/store/index.js';

export default {
  onLaunch: function () {
    console.log('App Launch');
    // 初始化状态管理（恢复登录状态）
    initStore();
  },
  onShow: function () {
    console.log('App Show');
  },
  onHide: function () {
    console.log('App Hide');
  },
};
</script>

<style>
/* 全局公共样式 */
page {
  background-color: #f5f5f5;
  font-size: 28rpx;
  color: #333;
}
</style>
