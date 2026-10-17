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
npm run content:publish       # 增量发布（只发送新增/修改的文章）
npm run content:publish -- --full   # 强制全量发布
npm run content:watch-d1      # 监听 Obsidian vault，改动自动增量发布
```

每篇文章在首次发布时获得一个随机 UUID 作为公开 ID，`source_path`
（内部文件路径）只存在 D1 里，绝不会出现在任何公开接口响应中。
换电脑、换客户端发布，ID 都保持稳定。增量对比用的内容哈希清单
保存在 `<vault>/_posts/.oblivion-state.json`，跟随 iCloud 同步。

## 前端接入

构建站点时设置环境变量：

```bash
VITE_CONTENT_API_URL=<Worker 地址> npm run build
```

本地开发想看真实内容时，先 `npm --prefix workers/content run dev`，
再把 `VITE_CONTENT_API_URL=http://localhost:8787` 写进 `.env`。


## 动态数据库

`MOMENTS_DB` 绑定现有的 `oblivion-moments` 数据库（ID：
`4db5c06d-56b9-46df-bc04-31bec559d1f1`），与文章数据库 `DB` 分开。
公开只读接口 `GET /api/moments` 返回 `{ moments: [...] }`，按时间倒序。

沿用库中现有的 `articles` 表和字段：`time`、`content`、`media`、`tags`、
`location`、`music`。接口把时间戳转为上海时区的展示时间，解析媒体与音乐 JSON，
仅返回展示所需字段。媒体的 `img` / `vid` 分别转换为图片 / 视频。
**不要对动态库执行文章用的 `schema.sql` 或 `db:init`。** 接入无需迁移或导入示例数据。

动态页与首页的统计、最新动态、日历、手记共用一份请求状态；真实空库保持为空，
请求失败会在动态页显示重试入口。数据库没有点赞列，点赞仍仅保存在访问者设备上。
动态接口使用 `Cache-Control: no-store`；客户端切换页面时，会重新读取超过一分钟的共享缓存。

部署绑定和接口：`npm run deploy`。前端沿用 `VITE_CONTENT_API_URL`，无需暴露数据库凭据。
