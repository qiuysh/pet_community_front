# 宠物社区 · 前端

社区前台与管理后台的 Web 客户端（独立仓库 / 分支）。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建**: Vite
- **样式**: Tailwind CSS 4
- **组件**: HeroUI
- **状态**: Zustand
- **路由**: React Router 6
- **请求**: axios
- **包管理**: pnpm

## 目录结构

```
├── src/
│   ├── api/           # API 封装
│   ├── components/    # UI / 业务组件
│   ├── hooks/         # 自定义 Hooks
│   ├── pages/         # 页面
│   ├── router/        # 路由
│   ├── stores/        # Zustand
│   ├── styles/        # 全局样式与主题
│   ├── types/         # 类型
│   └── utils/         # 工具方法
├── e2e/               # Playwright E2E
├── public/
├── index.html
└── package.json
```

## 环境要求

- Node.js >= 18
- pnpm

依赖后端 API（默认 `http://localhost:8083`），需另行启动后端服务。

## 快速开始

```bash
pnpm install
pnpm dev
```

开发服务默认：`http://localhost:3000`  
`/api` 已代理到后端 `http://localhost:8083`（见 `vite.config.ts`）。

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 本地开发 |
| `pnpm build` | 生产构建 |
| `pnpm typecheck` | TypeScript 检查 |
| `pnpm lint` | ESLint |
| `pnpm test` | 单元测试（Vitest） |
| `pnpm test:e2e` | E2E（Playwright） |

E2E 前置条件与账号见 [e2e/README.md](./e2e/README.md)。

