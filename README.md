# Uniapp 企业级项目模板

> 基于 uni-app + Vue 3 + Vite 的企业级项目模板

## 快速开始

```bash
# 安装依赖
pnpm install

# 微信小程序
pnpm run dev:mp-weixin

# H5
pnpm run dev:h5
```

## 核心特性

- 请求取消机制（防竞态、防重复）
- Token 管理（并发控制、自动刷新）
- 多环境切换（dev/prod/local）
- 页面缓存（解决 URL 参数限制）
- 工程化配置（ESLint + Prettier + Husky + Commitizen）

## 目录结构

```
src/
├── api/core/       # 请求封装（拦截器、取消机制）
├── auth/           # Token 管理
├── config/         # 配置
├── utils/          # 工具（环境管理、页面缓存）
├── pages/          # 页面
├── components/     # 组件
└── store/          # 状态管理
```

## 配置

环境变量在 `.env` 文件中配置：

```bash
VITE_LOCAL_API_BASE_URL=http://localhost:3000
VITE_DEV_API_BASE_URL=https://api-dev.example.com
VITE_PROD_API_BASE_URL=https://api.example.com
```

## 文档

详细使用说明请查看：

- [核心功能使用指南](./docs/核心功能使用指南.md) - 请求取消、Token 管理、环境切换等
- [开发规范](./docs/开发规范.md) - 代码规范、提交规范

## 常用命令

```bash
pnpm run dev:mp-weixin   # 开发（微信）
pnpm run build:mp-weixin # 构建（微信）
npx cz                   # 规范化提交
```

## License

MIT
