# 🐾 宠物社区 Web 应用

一个面向宠物爱好者的社区平台，提供宠物档案管理、社区互动、社交交流等功能。

## 🛠️ 技术栈

- **框架**: React 18+
- **语言**: TypeScript 5+
- **构建工具**: Vite
- **样式**: TailwindCSS 3+
- **组件库**: shadcn/ui
- **状态管理**: Zustand
- **HTTP 客户端**: axios



## 📁 项目结构

```bash
pet_community/
├── front/                 # 前端代码
│   ├── src/
│   │   ├── components/    # UI 组件
│   │   ├── pages/         # 页面组件
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── api/           # API 请求封装
│   │   ├── stores/        # Zustand 状态管理
│   │   ├── router/        # 路由配置
│   │   ├── utils/         # 工具函数
│   │   └── types/         # 类型定义
│   ├── public/            # 静态资源
│   └── index.html         # HTML 入口
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0

### 前端启动

```bash
cd front
pnpm install
pnpm run dev
```

## 🔧 配置说明

前端配置文件位于 `front/.env`：

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_APP_NAME=宠物社区
```
