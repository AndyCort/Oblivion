# Oblivion 内容 Worker（D1）

把 Obsidian 文章存进 Cloudflare D1，通过本 Worker 提供只读接口。
真实文件路径只存在于本地 Obsidian vault，公网完全不可见。

## 首次部署

1. 安装依赖：`npm install`
2. 登录：`npx wrangler login`
3. 创建数据库：`npm run db:create`，把输出的 `database_id` 填进 `wrangler.toml`
4. 初始化表结构：`npm run db:init`
5. 设置发布密钥：`npx wrangler secret put PUBLISH_SECRET`
6. 部署：`npm run deploy`，得到类似 `https://oblivion-content.<子域>.workers.dev` 的地址
7. 把 Worker 地址和 PUBLISH_SECRET 写进项目根目录 `.env`：
   - `WORKER_URL=https://oblivion-content.<子域>.workers.dev`
   - `PUBLISH_SECRET=<与第 5 步一致>`

## 发布内容

在项目根目录执行：

```bash
npm run content:publish   # 全量发布
npm run content:watch-d1  # 监听 Obsidian vault，改动自动发布
```

每篇文章在首次发布时获得一个随机 UUID 作为公开 ID，`source_path`
（内部文件路径）只存在 D1 里，绝不会出现在任何公开接口响应中。
换电脑、换客户端发布，ID 都保持稳定。

## 前端接入

构建站点时设置环境变量：

```bash
VITE_CONTENT_API_URL=<Worker 地址> npm run build
```

本地开发想看真实内容时，先 `npm --prefix workers/content run dev`，
再把 `VITE_CONTENT_API_URL=http://localhost:8787` 写进 `.env`。
