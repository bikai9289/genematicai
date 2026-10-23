# 环境变量配置管理

网站配置管理页面、读取/保存/自定义配置接口和在线测试接口已停用，Agent REST/MCP 也不再提供这些操作。用户、订单、积分、作品和工单等正常管理功能不受此变更影响。

应用配置只读取部署环境，不再读取或合并 D1 `config` 表。旧表保留为加密回滚备份，不删除订单、用户或积分，也不修改数据库结构。已有 `CONFIG_ENCRYPTION_KEY` 暂保留用于备份恢复，不再参与正常配置加载。

## 在哪里修改

Cloudflare → Workers & Pages → genematicai → Settings → Variables and Secrets。

| 用途                        | 变量名称                                  | 存储方式                               |
| --------------------------- | ----------------------------------------- | -------------------------------------- |
| KIE 密钥                    | KIE_API_KEY                               | Secret                                 |
| KIE 自定义服务地址（可选）  | KIE_BASE_URL                              | Variable                               |
| Stripe 开关                 | STRIPE_ENABLED                            | Variable，true / false                 |
| Stripe 公钥                 | STRIPE_PUBLISHABLE_KEY                    | 当前也作为 Secret 保存，避免不必要展示 |
| Stripe 私钥、签名密钥       | STRIPE_SECRET_KEY / STRIPE_SIGNING_SECRET | Secret                                 |
| 邮件密钥                    | RESEND_API_KEY                            | Secret                                 |
| 发件地址                    | RESEND_SENDER_EMAIL                       | 当前作为 Secret 保存                   |
| 邮件回复地址                | RESEND_REPLY_TO                           | Variable                               |
| 邮箱验证                    | EMAIL_VERIFICATION_ENABLED                | Variable，true / false                 |
| R2 账户、桶                 | R2_ACCOUNT_ID / R2_BUCKET_NAME            | Variable                               |
| R2 服务地址、公开域名、目录 | R2_ENDPOINT / R2_DOMAIN / R2_UPLOAD_PATH  | Variable                               |
| R2 访问密钥、私钥           | R2_ACCESS_KEY / R2_SECRET_KEY             | Secret                                 |

Stripe 仍沿用迁移前的测试密钥，未自动切为正式收款。以后切换时，需同时更新该环境的私钥、公钥和 Webhook 签名密钥，并复验订单及积分到账。

普通运行时配置未硬编码进 wrangler 的 vars，部署保留 `keep_vars: true`，因此后续 Git 部署不会把 Dashboard 修改的开关覆盖回旧值。网站 URL、名称等 `VITE_` 公开变量同时参与构建，变更时需同步构建配置并重新构建；任何私钥都不能加 VITE\_ 前缀。

本地开发复制 `.env.example` 为 `.env.development` 并按需填写；本地文件不提交仓库。其他预定义设置使用原键名的大写环境变量。全部映射可用以下单行命令查看，只输出名称，不输出当前值：

```powershell
pnpm.cmd exec tsx scripts/config-env-map.ts
```

非预定义的自定义键放入 `CUSTOM_CONFIG_JSON`，内容为字符串到字符串的 JSON 对象。它不能覆盖认证、数据库等预定义键，包含敏感值时必须存为 Secret。

更新一个密钥也可在本机交互执行，密钥粘贴到隐藏输入中，不放在命令参数、聊天或 Git：

```powershell
pnpm.cmd exec wrangler secret put KIE_API_KEY --name genematicai
```

## 迁移验证与边界

- 29 条原配置逐项校验一致，KIE、R2 和 Stripe 密钥以密封方式转移，未打印明文。
- KIE 只查询余额，没有创建新的付费生成任务。
- R2 实测上传与公开图片读取。
- Stripe 仅创建并作废沙盒 Checkout，验证线上 Webhook 签名，没有执行付款。
- 邮件测试通过真实网站请求发送重置密码邮件，未修改密码；实际收件仍由收件端确认。
- 临时密封迁移通道及其凭据已移除；该路径永久返回 404。
- 本轮不应用另一审核分支的 moderation_logs 生产迁移。

定向配置、权限入口和保密性测试覆盖本次变更。现有完整 admin-agent 测试还包含 Windows 下不支持的 POSIX 文件模式断言和临时 SQLite 清理问题，不把这些基线问题记为本轮已修复。
