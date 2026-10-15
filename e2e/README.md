# E2E 测试（Playwright）

> 前台 + 后台关键功能页的端到端覆盖，使用真实后端 + Playwright Chromium。

## 目录结构

```
e2e/
├── fixtures/
│   └── auth.ts                        # 测试账号、登录/登出工具
├── phase-1-foundation.spec.ts         # Phase1：用户注册/登录、个人主页、宠物档案、寻宠启事（含联系方式脱敏）、后台基础
├── phase-2-content.spec.ts            # Phase2：动态列表/发布、评论、点赞、收藏、动态管理、可见范围 D5、话题关联 D3、@用户 D4、分享 I5、举报 I6
├── phase-3-social.spec.ts             # Phase3：关注/拉黑双向屏蔽、私信权限/限制、通知 N1-N8、积分等级
├── phase-4-discovery.spec.ts          # Phase4：推荐流筛选、话题广场/分类/创建 T5、全局搜索 S1-S6、分类浏览 C1-C4、热门排行榜
└── phase-5-admin.spec.ts              # Phase5：领养中心、活动中心（报名/作品/投票/评选 A6/线下 A7）、后台管理、角色权限

playwright.config.ts                   # Playwright 配置
tsconfig.e2e.json                      # E2E 专用 tsconfig
```

## 前置条件

1. **后端服务运行中**（默认 `localhost:8083`，可执行 `cd server && go run cmd/main.go`）
2. **MySQL 已初始化**（已执行 `server/sql/init/create.sql`，开发/E2E 另执行 `server/sql/incremental/20260724100000_seed_dev_data.sql`，详见 `server/sql/README.md`）
3. **已下载 Chromium**：`pnpm exec playwright install chromium`
4. **前端 dev server 运行中**（默认 `localhost:3000`，见 `front/vite.config.ts`）：`pnpm dev`

> 也可在 `playwright.config.ts` 中开启 `webServer` 自动启动 dev server。

## 常用命令

| 命令 | 用途 |
|------|------|
| `pnpm test:e2e` | 运行全部 E2E 用例 |
| `pnpm test:e2e phase-1-foundation.spec.ts` | 运行指定阶段 |
| `pnpm test:e2e --ui` | Playwright UI 调试 |
| `pnpm test:e2e --headed` | 弹窗可见模式 |
| `pnpm test:e2e:report` | 打开 HTML 报告 |

## 测试数据

| 端 | 账号 | 密码 |
|----|------|------|
| 前台 | `13800138001` | `user123456` |
| 前台 | `13800138002` | `user123456` |
| 后台 | `admin` | `admin123` |
| 后台 | `content_admin` | `admin123` |
| 后台 | `data_admin` | `admin123` |
| 后台 | `service` | `admin123` |

修改请到 [e2e/fixtures/auth.ts](./fixtures/auth.ts)。

> 后台账号密码见 `server/sql/init/create.sql`（`admin123`）。前台测试账号密码见 `server/sql/incremental/20260724100000_seed_dev_data.sql`（`user123456`）。

## 用例覆盖（按阶段）

| 阶段 | 文件 | 用例数 | 说明 |
|------|------|--------|------|
| Phase1 基础搭建 | `phase-1-foundation.spec.ts` | 34 | 用户注册/登录、个人主页、宠物档案、寻宠启事（含联系方式脱敏 §4.11）、后台基础登录/设置 |
| Phase2 内容互动 | `phase-2-content.spec.ts` | 23 | 动态列表/发布、评论、点赞、收藏、编辑/删除动态、草稿/收藏列表、可见范围三档 D5（§4.6）、话题关联 D3、@用户 D4、分享 I5、举报 I6 |
| Phase3 社交功能 | `phase-3-social.spec.ts` | 28 | 关注/取消关注、关注/粉丝/拉黑列表、互关标识、悄悄关注、拉黑双向屏蔽 F7（§4.2）、私信权限/拉黑限制 M1-03/04（§4.7）、通知 N1-N8、积分/等级 |
| Phase4 内容发现 | `phase-4-discovery.spec.ts` | 24 | 推荐流筛选、话题广场/分类/创建 T5（§4.3 Lv5+）、全局搜索 S1-S6、分类浏览 C1-C4（§4.13）、热门排行榜（日/周/月） |
| Phase5 活动与管理 | `phase-5-admin.spec.ts` | 47 | 领养中心、活动中心（报名/作品/投票/评选 A6/线下 A7）、后台12个管理页、4种角色权限 |
| **合计** | | **156** | |

> 用例数含 `test.skip(true, ...)` 占位用例（用于标注未实现/跨账号场景待补的能力组），便于后续按 spec 落地后逐项启用。
>
> **跨账号场景落地进度**：`V-N4-01 关注通知生成` 已启用真实双会话实现（`dualSessions` 工具 + `actor.request` 调关注 API + viewer 侧 UI 验证通知）。其余跨账号场景（N1-01/N2-01/N3-01/N4-03/F7-05/M1-03）仍为 skip 占位，待按相同模式逐项启用。

## 注意事项

- **真实后端**：依赖后端服务 + MySQL 运行，缺一会失败
- **幂等性**：发布动态等写操作会向数据库添加记录，请按需重置 seed
- **CI 加速**：通过 `CI=1 pnpm test:e2e` 启用单 worker + 失败重试 1 次
- **skip 兼容**：当数据为空时（如领养列表）会自动 skip 依赖数据的用例
