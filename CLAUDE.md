# Star Gazer — Project Context

基于 [Mihomo Party](https://github.com/mihomo-party-org/clash-party) 的 fork + rebrand。
另一款 [Mihomo](https://github.com/MetaCubeX/mihomo) GUI 客户端。

## 仓库

| 角色 | 地址 | 默认分支 |
|------|------|----------|
| Upstream | `github.com:mihomo-party-org/clash-party` | `smart_core` |
| Origin | `github.com:markd3ng/stargazer` | `smart_core` |

## 技术栈

- **Runtime:** Electron 41 + Node.js
- **Language:** TypeScript (strict)
- **UI:** React 19 + HeroUI + Tailwind CSS 4
- **State:** SWR + React Context
- **Build:** electron-vite + pnpm
- **Editor:** Monaco Editor
- **Animations:** framer-motion
- **Package Manager:** pnpm only

## 关键规则文件

| 文件 | 内容 |
|------|------|
| [`AGENTS.md`](AGENTS.md) | 提交规范、版本号纪律、TDD、代码风格、IPC 协议、安全策略 |
| [`docs/rules/upstream_merge.md`](docs/rules/upstream_merge.md) | **Upstream 合并流程** — 冲突分类、Fork DNA、逐文件解法、验证清单 |

## 合并 Upstream 前必读

在合并 `upstream/smart_core` 之前，必须先阅读 [`docs/rules/upstream_merge.md`](docs/rules/upstream_merge.md)。

核心规则：
- **永远 `git merge`，禁止 `git rebase`**
- **保护 Fork DNA** — 重命名（Star Gazer）、移除项（Sub-Store/Telegram/教程）、分支独有功能
- 冲突按 A/B/C/D/E 五类处理，不能无脑取一边

## 目录结构

```
src/
├── main/               # Electron 主进程
│   ├── config/         # 配置管理（app、profile、override、controledMihomo）
│   ├── core/           # 内核通信（mihomoApi、manager、factory）
│   ├── resolve/        # 功能实现（autoUpdater、backup、gistApi、theme、server、tray）
│   ├── sys/            # 系统集成（autoRun、sysproxy、misc）
│   └── utils/          # 工具（ipc、template、dirs、logger、age）
├── preload/            # Preload 脚本
├── renderer/src/       # React 前端
│   ├── components/     # UI 组件（按域分组）
│   ├── hooks/          # 自定义 hooks
│   ├── locales/        # i18n（zh-CN, zh-TW, en-US, ru-RU, fa-IR）
│   ├── pages/          # 页面组件
│   ├── routes/         # 路由配置
│   └── utils/          # 前端工具
└── shared/             # 共享类型 + 默认常量
    ├── types.d.ts      # 所有类型定义
    └── appConfig.ts    # 默认配置常量（DEFAULT_*）
```

## 命名约定

- **文件:** kebab-case（`connection-table.tsx`, `use-app-config.ts`）
- **组件:** PascalCase，一文件一组件
- **Hooks:** `use-` 前缀
- **Pages:** `src/renderer/src/pages/`，扁平，按路由命名

## IPC 架构

```
Renderer (ipc.ts Proxy) → contextBridge → Main (ipc.ts handlers)
                         ↘ preload/index.ts (三份白名单)
```

所有 IPC 通道必须在 `preload/index.ts` 的三份白名单中注册：`validInvokeChannels`、`validListenChannels`、`validSendChannels`。
