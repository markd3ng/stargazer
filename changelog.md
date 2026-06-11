# 1.10.0

## 新功能 (Feat)

- 新增 Tailscale 认证日志检测 + 桌面通知
- 新增代理项 Tooltip（悬浮显示类型和延迟）
- 新增订阅证书指纹校验支持
- 新增 DNS IPv6 fake-ip-range 配置
- 新增 TUN ICMP 转发禁用开关

## 修复 (Fix) / 重构 (Refactor)

- 完整重命名 clash-party → Star Gazer（窗口标题、locale、Socket、备份、自动更新等）
- 修复 macOS 环境变量复制无效
- 移除 Sub-Store 集成
- 移除首次启动交互式教程
- 精简 CI/CD 流水线（仅 macOS arm64 DMG + Windows x64/arm64 + Linux）
- 清理残留 import 和废弃代码
- 修复 dns.ts 命令注入风险

# 1.9.6

## 新功能 (Feat)

## 性能优化 (Performance)

- 重构简化连接页
- 优化软件启动和退出速度

## 修复 (Fix)

- 修复修改 Mihomo 设置（如日志等级、端口等）后未应用到运行中内核的问题

