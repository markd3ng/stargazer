# Upstream Merge 规则

> 本文档定义从上游 `mihomo-party-org/clash-party` 合并最新提交的标准流程。

## 仓库关系

| 角色 | 仓库 | 默认分支 |
|------|------|----------|
| **Upstream** | `github.com:mihomo-party-org/clash-party` | `smart_core` |
| **Origin（本分支）** | `github.com:markd3ng/stargazer` | `smart_core` |

本分支是 upstream 的 **fork + rebrand**，项目名从 "Clash Party" 改为 "Star Gazer"，并移除了部分功能。

## 分支永久差异（Fork DNA）

以下差异是**故意的、持久的**，每次合并时必须保留分支版本，禁止被 upstream 覆盖：

### 1. 重命名（Clash Party → Star Gazer）
- 产品名、窗口标题、locale 字符串
- Gist 描述：`"Auto Synced Star Gazer Runtime Config"`
- User-Agent：`stargazer/v${version}`
- 更新 URL：`github.com/markd3ng/stargazer/releases`
- 主题 Hub URL：`github.com/markd3ng/theme-hub/releases`
- Bundle ID：`party.stargazer.*`
- 仓库 URL / homepage

### 2. 已移除的功能
| 移除项 | 涉及文件 |
|--------|----------|
| Sub-Store 集成 | `server.ts`, `ipc.ts`, `template.ts`, `types.d.ts`, `appConfig.ts`, 所有 locale 文件 |
| Telegram 通知 | `ipc.ts`, 相关脚本 |
| 交互式教程 (driver.js) | `App.tsx`, `package.json` |
| sub-store 侧边栏卡片 | `appConfig.ts` (`DEFAULT_SIDER_ORDER`) |

### 3. 分支独有功能（保留）
- TUN ICMP 转发禁用 (`disable-icmp-forwarding`)
- DNS IPv6 fake-ip-range (`fake-ip-range6`)
- 证书指纹校验 (`fingerprint`)
- Tailscale 认证日志检测 + 桌面通知
- 代理详情 Tooltip

### 4. CI/CD 差异
- 仅构建 macOS arm64 DMG + Windows x64/arm64 + Linux
- 无 pkg 格式（macOS 使用 DMG）

## 合并策略

### 永远用 merge，禁止 rebase

```bash
# ✅ 正确
git merge upstream/smart_core --no-commit --no-ff

# ❌ 错误
git rebase upstream/smart_core
```

**原因：** 分支有大量重命名提交（27+），rebase 会让每个提交重新解决相同的重命名冲突。merge 只解一次。

### 标准流程

```bash
# 1. 确保 remote 存在
git remote add upstream git@github.com:mihomo-party-org/clash-party.git

# 2. 拉取最新
git fetch upstream

# 3. 检查差异
git log --oneline --left-right origin/smart_core...upstream/smart_core

# 4. 执行合并（不自动提交）
git merge upstream/smart_core --no-commit --no-ff

# 5. 解决冲突（见下文冲突分类）
# 6. 验证
pnpm install --no-frozen-lockfile
pnpm typecheck

# 7. 提交
git add -A
git commit -m "merge: upstream/smart_core

- <列出关键变更>"

# 8. 版本号 + changelog + tag
# （遵循 AGENTS.md Rule 3: Version Number Discipline）
```

## 冲突分类与解法

### A 类：无脑操作

| 场景 | 操作 |
|------|------|
| `pnpm-lock.yaml` | 删掉，合并后 `pnpm install --lockfile-only` 重新生成 |
| `substore-*.tsx` 被 upstream 修改 | `git rm`，保留删除 |

### B 类：重命名冲突（取分支名字 + upstream 逻辑）

| 文件 | 冲突原因 | 解法 |
|------|----------|------|
| `autoUpdater.ts` | URL / 端口默认值 | 保留 `markd3ng/stargazer` URL，取 upstream 的 `DEFAULT_MIHOMO_PORTS` |
| `theme.ts` | 主题 Hub URL | 保留分支 URL，取 upstream 端口默认值 |
| `server.ts` | upstream 加了 sub-store server | 保留分支版本（无 sub-store），**删除 upstream 新增的全部 sub-store 代码块** |
| `gistApi.ts` | Gist 描述文案 | 保留 `Star Gazer` 描述，取 upstream 的 age 加密逻辑 |
| `template.ts` | 字段差异 | 见下方详细说明 |

### C 类：功能合并（两边都保留）

| 文件 | 冲突原因 | 解法 |
|------|----------|------|
| `profile.ts` | 分支改名 + upstream 加 axios/age 加密 | 保留分支 UA 字符串，取 upstream 的 axios 请求 + age 解密逻辑，**去掉 substore 路由分支** |
| `ipc.ts` | 两边各自增删 IPC handler | 保留分支 handlers，添加 upstream 的 `generateGistAgeKeyPair` / `exportGistAgeSecretKey`，**不加 subStore handlers** |
| `App.tsx` | 分支自定义 sider + upstream 重构 | 取 upstream 的 `DEFAULT_SIDER_ORDER` + `lastSelectedSiderCard` + 类型注解，删除分支内联的 `ALL_SIDER_KEYS` / `mergeSiderOrder`（改用 `utils/sider.ts`） |
| `dns.tsx` | 分支加 `fake-ip-range6` + upstream 集中默认值 | 取 upstream 的 `DEFAULT_MIHOMO_DNS_CONFIG` 默认值，保留 `fake-ip-range6` |
| `tun.tsx` | 分支加 `disable-icmp-forwarding` + upstream 集中默认值 | 取 upstream 的 `DEFAULT_MIHOMO_TUN_CONFIG` 默认值，保留 `disable-icmp-forwarding` |
| `profiles.tsx` | upstream 加 sub-store import | **删除** upstream 新增的 `useSubStore` / `openInfoImport` / `subStoreImporting` / `EditInfoModal`（import 模式）相关代码 |

### D 类：类型定义

| 文件 | 冲突原因 | 解法 |
|------|----------|------|
| `types.d.ts` | 两边各自加了字段 | 保留分支字段（`fingerprint`）+ upstream 字段（`ageSecretKey`, `updateTimeout`, `gistAge*`），删除 `ISubStoreSub` 接口和 sub-store 相关字段 |

### E 类：文档

| 文件 | 操作 |
|------|------|
| `changelog.md` | 合并两边条目，去重 |

## template.ts 详细差异

`src/main/utils/template.ts` 是**默认配置的单一真相源**，融合规则：

```
                    defaultConfig（IAppConfig）
分支字段:           无 sub-store 字段，有 smart_core 字段
Upstream 字段:      有 useSubStore, autoQuitWithoutCore* 等
→ 保留:             移除所有 sub-store 字段

                    siderOrder
分支:               硬编码数组（不含 substore）
Upstream:           DEFAULT_SIDER_ORDER（含 substore）
→ 保留:             使用 DEFAULT_SIDER_ORDER，但确保不含 'substore'

                    defaultControledMihomoConfig.tun
分支:               硬编码完整对象 + disable-icmp-forwarding
Upstream:           ...DEFAULT_MIHOMO_TUN_CONFIG 展开
→ 保留:             使用展开 + device 覆盖 + disable-icmp-forwarding

                    defaultControledMihomoConfig.dns
分支:               硬编码完整对象 + fake-ip-range6
Upstream:           DEFAULT_MIHOMO_DNS_CONFIG 引用
→ 保留:             使用引用，但确保 DEFAULT_MIHOMO_DNS_CONFIG 含 fake-ip-range6
```

## appConfig.ts 默认值维护

`src/shared/appConfig.ts` 是**共享默认常量**，合并后必须检查：

| 常量 | 检查项 |
|------|--------|
| `DEFAULT_SIDER_ORDER` | 不含 `'substore'` |
| `DEFAULT_MIHOMO_DNS_CONFIG` | 含 `'fake-ip-range6': ''` |
| `DEFAULT_NAMESERVER_POLICY` | 使用 upstream 版本（从硬编码迁移） |

## 验证清单

合并完成后，按顺序执行：

```bash
# 1. 无残留冲突标记
grep -rn "<<<<<<< HEAD\|>>>>>>> upstream" src/ changelog.md package.json
# 应无输出

# 2. 依赖安装
pnpm install --no-frozen-lockfile

# 3. 类型检查
pnpm typecheck

# 4. Lint + Format
pnpm lint:check
pnpm format:check

# 5. 关键文件人工确认
# - changelog.md 两边条目都已包含
# - package.json version 是分支版本号
# - template.ts 无 sub-store 引用
# - types.d.ts 无 ISubStoreSub
# - DEFAULT_SIDER_ORDER 无 substore

# 6. 构建验证
pnpm build:mac    # 或其他目标平台
```

## 版本号

合并 upstream 后版本号规则：
- **仅 upstream fixes / chores** → PATCH bump（如 `1.10.1` → `1.10.2`）
- **含 upstream 新功能** → MINOR bump（如 `1.10.1` → `1.11.0`）
- 版本号在合并提交之后的独立 commit 中更新

## 相关文件

| 文件 | 用途 |
|------|------|
| `AGENTS.md` | 提交规范、版本号纪律 |
| `CLAUDE.md` | 项目上下文、规则索引 |
| `src/shared/appConfig.ts` | 共享默认常量 |
| `src/main/utils/template.ts` | 默认配置模板 |
| `src/shared/types.d.ts` | 类型定义 |
