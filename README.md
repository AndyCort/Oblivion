# Oblivion

React + TypeScript + Vite 博客，内容由 Cloudflare Worker + D1 提供。本地 Markdown 发布脚本位于 `scripts/`。

## 开发与检查

```sh
npm ci
npm --prefix workers/content ci
npm run dev
```

```sh
npm run check             # 前端 / Vite 类型检查与行为回归测试
npm run worker:typecheck  # 根据 Wrangler 配置生成类型并检查 Worker
npm run build             # 生产构建
```

测试使用 Node.js 内置测试运行器和项目已有的 TypeScript 编译器，不访问线上 API，不写入生产数据库。Worker 类型检查需要先安装根目录与 Worker 两处依赖；生成文件位于已忽略的 `.wrangler/` 中。

## 代码约定

- 前端、构建配置、Worker 分别由各自的 TypeScript 配置检查；前端与 Worker 启用严格模式和未使用代码检查。
- React 文章列表加载复用 `src/hooks/useArticles.ts`，组件卸载时中止请求。API 返回空列表时保持为空；网络异常仍沿用原有示例文章回退行为。
- 主题、语言与加载动画通过 `src/utils/storage.ts` 读写偏好，浏览器禁止存储时回退到当前页面内存。
- 文章发布数据先经 `workers/content/src/validation.ts` 校验，再写入数据库。无效载荷返回 400；发布仍需 `x-publish-secret`。
- Markdown 解析只维护在 Worker 中；本地脚本监听到连续变化时串行发布，避免并发覆盖同步清单。
- 主题变量 CSS 由 `src/config/theme.config.ts` 生成，不直接修改生成文件。

## 后续质量事项

目前构建可以通过，但仍有部分主题背景图片缺失，以及文章详情 JavaScript 包超过 500 kB 的提示。两个字体文件合计约 20 MB，可后续评估字体子集化和代码高亮语言裁剪。发布回归测试使用模拟 D1，不能替代部署环境集成验证。

内容服务的部署与发布配置见 [Worker 说明](workers/content/README.md)。
