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

目前构建可以通过，文章详情 JavaScript 包仍有超过 500 kB 的提示。两个字体文件合计约 20 MB，可后续评估字体子集化和代码高亮语言裁剪。发布回归测试使用模拟 D1，不能替代部署环境集成验证。

内容服务的部署与发布配置见 [Worker 说明](workers/content/README.md)。

## 主题维护

- `src/config/theme.config.ts` 是统一注册入口，五套风格分别位于 `src/config/themes/`，公共变量与类型位于 `tokens.ts`。新增风格文件并注册时提供唯一 `id`、中英文名称、`cardCss`、完整 `light` 和增量 `dark`，可选 `video`。变量使用 CSS 名称（例如 `main-color`），由 `ThemeTokens` 检查必要字段；通常从 `defaultLight` / `defaultDark` 展开再覆盖。
- 深色解析规则为 `light + dark`；希望采用通用深色配色时，在 `dark` 中展开 `defaultDark`。每套风格均提供 `bg-0` 到 `bg-3`。
- `src/theme/model.ts` 统一默认值、偏好校验和变量解析；`src/theme/build.ts` 生成 CSS 与首屏脚本。开发时修改其依赖会触发 Vite 配置重载并重新生成，生产构建使用同一入口。不要手动编辑 `src/styles/theme-vars.css`。
- `themeStore.ts` 管理用户模式、实际深浅色和视觉风格，使用 `useSyncExternalStore` 订阅。读取实际颜色模式请使用 `useTheme().effectiveTheme`。旧存储键 `theme`、`card-style` 保持兼容。
- `<div data-card>` 跟随全局卡片风格；`<div data-card="base">` 固定卡片外观，但仍使用当前全局配色。两类规则不叠加。全局深浅色只使用 `data-theme`，不再维护 `.dark-mode`。
- 首屏和运行时均设置 `data-theme`、`data-card-style`、`color-scheme` 与 `theme-color`。系统模式变化、跨标签页偏好变更会同步；禁止存储时当前页面仍可切换。
- `tests/theme.test.mjs` 覆盖各风格解析、首屏回退、系统模式更新、存储同步与监听清理。

主题注册表在构建时校验：ID 必须唯一且使用小写字母、数字或连字符（字母开头）；默认风格必须存在；变量不能缺失、为空或包含未知名称。菜单只在展开时订阅外部指针和键盘事件，Tab 离开后自动关闭。重复选择不会重复写入偏好或 DOM，仅订阅卡片风格的组件不会因深浅色变化而重新渲染。

主题面板使用双列预览，按视口宽高限制位置及滚动区域。预览通过 `data-card` 复用生成的卡片 CSS，不再单独注入样式。语义色 `--link-color`、`--accent-soft`、`--accent-border`、`--accent-glow`、`--table-stripe` 由当前配色派生，正文与背景共用。减少动态效果时禁用主题面板缩放、卡片过渡与首页背景视频；视频加载或播放失败保留静态背景。
