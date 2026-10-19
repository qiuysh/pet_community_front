# E2E 测试（Playwright）

> 前台 + 后台关键功能页的端到端覆盖，使用真实后端 + Playwright Chromium。

## 目录结构

```
e2e/
├── fixtures/
│   └── auth.ts                        # 测试账号、登录/登出/双会话工具、带鉴权的 apiWrite
│
│   # —— 按阶段的主覆盖 ——
├── phase-1-foundation.spec.ts         # Phase1：用户注册/登录、个人主页、宠物档案、寻宠启事（含联系方式脱敏）、后台基础
├── phase-2-content.spec.ts            # Phase2：动态列表/发布、评论、点赞、收藏、动态管理、可见范围 D5、话题关联 D3、@用户 D4、分享 I5、举报 I6
├── phase-3-social.spec.ts             # Phase3：关注/拉黑双向屏蔽、私信权限/限制、通知 N1-N8、积分等级
├── phase-4-discovery.spec.ts          # Phase4：推荐流筛选、话题广场/分类/创建 T5、全局搜索 S1-S6、分类浏览 C1-C4、热门排行榜
├── phase-5-admin.spec.ts              # Phase5：领养中心、活动中心（报名/作品/投票/评选 A6/线下 A7）、后台管理、角色权限
│
│   # —— 补充覆盖（见 docs/specs/e2e-coverage-audit.md）——
├── phase-1-supplement.spec.ts         # 注册校验 V-U1、设置保存闭环 V-U6/U7/U8、宠物档案主流程 V-P1/P2/P3
├── phase-2-supplement.spec.ts         # 草稿箱闭环 V-D8、视频/话题/定位编辑 V-D2/D3/D6、删除动态闭环 V-I7
├── phase-3-supplement.spec.ts         # 跨账号通知生成 V-N1/N2/N3/N4-03、拉黑屏蔽 V-F7-05、私信门禁 V-M1-03、通知设置 V-N8、等级积分 V-L1/L2/L4、私信纵深 V-M6/M7/M9
├── phase-4-supplement.spec.ts         # 列表翻页加载 V-R2、话题创建门禁/提交 V-T5
└── phase-5-supplement.spec.ts         # 活动报名/作品/投票结果断言 V-A3/A4/A5、领养发布与申请闭环 V-A8

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
| Phase1 基础搭建 | `phase-1-foundation.spec.ts` | 37 | 用户注册/登录（不含其它方式登录深化）、个人主页、宠物档案、寻宠启事（含多图上传/联系方式脱敏 §4.11）、前后台页签标题、后台基础登录/设置 |
| Phase2 内容互动 | `phase-2-content.spec.ts` | 23 | 动态列表/发布、评论、点赞、收藏、编辑/删除动态、草稿/收藏列表、可见范围三档 D5（§4.6）、话题关联 D3、@用户 D4、分享 I5、举报 I6 |
| Phase3 社交功能 | `phase-3-social.spec.ts` | 28 | 关注/取消关注、关注/粉丝/拉黑列表、互关标识、悄悄关注、拉黑双向屏蔽 F7（§4.2）、私信权限/拉黑限制 M1-03/04（§4.7）、通知 N1-N8、积分/等级 |
| Phase4 内容发现 | `phase-4-discovery.spec.ts` | 27 | 推荐流筛选、话题广场/热门话题跳转/参与/分享、分类/创建 T5（§4.3 Lv5+）、全局搜索 S1-S6、分类浏览 C1-C4（§4.13）、热门排行榜（日/周/月） |
| Phase5 活动与管理 | `phase-5-admin.spec.ts` | 52 | 领养中心、活动中心、后台活动运营（列表/筛选/发布/报名审核）、广告位可选创建、日志双日期筛选、审核配置开关、驾驶舱报名深链、角色权限 |
| **小计（主覆盖）** | | **167** | |
| Phase1 补充 | `phase-1-supplement.spec.ts` | 9 | 注册表单校验（密码一致/验证码必填）、昵称保存落库、私信权限保存与恢复、改密校验、宠物创建/编辑/相册上传/成长记录 |
| Phase2 补充 | `phase-2-supplement.spec.ts` | 6 | 存草稿→草稿箱可见→续编→发布、视频选择预览与移除、关联话题并发布、设置定位并发布、删除动态后不可访问 |
| Phase3 补充 | `phase-3-supplement.spec.ts` | 13 | 点赞/评论/@ 通知生成、悄悄关注不通知、拉黑后动态屏蔽、仅粉丝私信门禁、通知开关保存与持久化、等级/积分记录/等级权益、私信未读清零/撤回/删除会话 |
| Phase4 补充 | `phase-4-supplement.spec.ts` | 2 | 动态列表翻页加载、话题创建（Lv5+ 门禁提示或提交成功） |
| Phase5 补充 | `phase-5-supplement.spec.ts` | 5 | 活动报名结果断言、提交作品结果断言、投票结果断言、发布领养、申请领养 |
| **合计** | | **202** | |

> 用例数含 `test.skip(true, ...)` 占位用例（用于标注未实现/跨账号场景待补的能力组），便于后续按 spec 落地后逐项启用。
>
> **跨账号场景落地进度**：`V-N4-01 关注通知生成` 已启用真实双会话实现（`dualSessions` 工具 + `actor.request` 调关注 API + viewer 侧 UI 验证通知）。其余跨账号场景（N1-01/N2-01/N3-01/N4-03/F7-05/M1-03）仍为 skip 占位，待按相同模式逐项启用。
>
> **今日补全（不含其它方式登录）**：寻宠多图上传、话题参与/热门话题跳转、前后台页签标题、活动运营列表/筛选/发布/报名审核、报名待办深链、广告创建选广告位、日志双日期、审核配置开关。

> **2026-10-16 补充覆盖**：按 [e2e-coverage-audit.md](../../docs/specs/e2e-coverage-audit.md) 的建议新增 5 个 supplement 文件（35 例），补齐此前只有"页面可达"或纯 skip 的主流程：宠物创建/编辑/相册/成长记录、设置保存闭环、草稿箱闭环、动态删除闭环、跨账号通知生成（N1/N2/N3/N4-03）、拉黑双向屏蔽、仅粉丝私信门禁、通知开关持久化、等级积分、私信未读/撤回/删除会话、列表翻页、话题创建门禁、活动报名/作品/投票结果断言、领养发布与申请。
>
> **仍未覆盖（受前端实现限制，非测试缺口）**：M3 图片消息、M4 语音消息、M8 消息搜索 —— `api/social.ts` 已有接口但 `chatPage` 无对应 UI，需先补前端交互才能写 UI 级用例。

## 注意事项

- **真实后端**：依赖后端服务 + MySQL 运行，缺一会失败
- **幂等性**：发布动态等写操作会向数据库添加记录，请按需重置 seed
- **CI 加速**：通过 `CI=1 pnpm test:e2e` 启用单 worker + 失败重试 1 次
- **skip 兼容**：当数据为空时（如领养列表）会自动 skip 依赖数据的用例
