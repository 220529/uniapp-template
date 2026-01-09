<template>
  <view class="page">
    <view class="header">
      <image class="logo" src="/static/logo.png" />
      <text class="title">Uniapp 模板</text>
      <text class="subtitle">开箱即用</text>
    </view>

    <view class="section">
      <!-- 状态管理 -->
      <view class="card">
        <view class="card-title">状态管理</view>
        <view class="info-row">
          <text>登录状态：{{ store.isLoggedIn ? '已登录' : '未登录' }}</text>
        </view>
        <view class="btn-group">
          <button class="btn" size="mini" @click="handleLogin">模拟登录</button>
          <button class="btn btn-outline" size="mini" @click="handleLogout">退出</button>
        </view>
      </view>

      <!-- 环境信息 -->
      <view class="card">
        <view class="card-title">环境信息</view>
        <view class="info-row">
          <text>当前环境：{{ currentEnv }}</text>
        </view>
        <view class="info-row">
          <text>今天：{{ currentDate }} {{ weekday }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { store, login, logout } from '@/store/index.js';
import { formatDate, getWeekday } from '@/utils/index.js';
import { getCurrentEnv } from '@/utils/env.js';

const currentDate = formatDate(new Date());
const weekday = getWeekday(new Date());
const currentEnv = getCurrentEnv();

const handleLogin = () => {
  login({ id: 1, name: '测试用户' });
  uni.showToast({ title: '登录成功', icon: 'success' });
};

const handleLogout = () => {
  logout();
  uni.showToast({ title: '已退出', icon: 'none' });
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 30rpx;
  background: #f5f5f5;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;

  .logo {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 20rpx;
  }

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }

  .subtitle {
    font-size: 26rpx;
    color: #999;
    margin-top: 10rpx;
  }
}

.section {
  margin-bottom: 30rpx;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .card-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.info-row {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.btn-group {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.btn {
  background: $primary-color;
  color: #fff;
  border: none;
  font-size: 24rpx;

  &.btn-outline {
    background: #fff;
    color: $primary-color;
    border: 2rpx solid $primary-color;
  }
}
</style>
