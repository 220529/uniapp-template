# Uniapp 企业级项目模板

> 基于 uni-app + Vue 3 + Vite，开箱即用

## 快速开始

```bash
git clone https://github.com/xxx/uniapp-template.git my-project
cd my-project
pnpm install
pnpm run dev:mp-weixin
```

## 核心功能

- 🚀 请求封装（拦截器、取消机制、防重复）
- 🔐 Token 管理（并发控制、自动刷新）
- 🌍 多环境切换（dev/prod/local）
- 📦 状态管理（轻量级，基于 Vue3 reactive）
- 📤 文件上传（组件 + API）
- 📡 事件总线（跨组件通信）
- 🛠 工具函数（日期、防抖、节流等）
- 💾 页面缓存（解决 URL 参数限制）
- ⚙️ 工程化（ESLint + Prettier + Husky + Commitizen）

## 目录结构

```
src/
├── api/            # 接口层
│   ├── core/       # 请求核心
│   └── upload.js   # 文件上传
├── auth/           # Token 管理
├── components/     # 通用组件
├── enums/          # 枚举管理
├── store/          # 状态管理
└── utils/
    ├── env.js      # 环境配置
    ├── page.js     # 页面工具（缓存、跳转）
    ├── eventBus.js # 事件总线
    ├── file.js     # 文件操作
    └── index.js    # 通用工具
```

## 配置

修改 `.env` 文件：

```bash
VITE_LOCAL_API_BASE_URL=http://localhost:3000
VITE_DEV_API_BASE_URL=https://api-dev.example.com
VITE_PROD_API_BASE_URL=https://api.example.com
```

## 常用命令

```bash
pnpm run dev:mp-weixin   # 微信小程序开发
pnpm run dev:h5          # H5 开发
pnpm run build:mp-weixin # 微信小程序构建
npx cz                   # 规范化提交
```

## License

MIT
