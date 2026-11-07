# Oblivion

React + TypeScript + Vite 博客，内容由 Cloudflare Worker + D1 提供。本地 Markdown 发布脚本位于 `scripts/`。

## 开发与检查

```sh
npm ci
npm --prefix workers/content ci
npm run dev
```

```sh
npm run typecheck         # 前端 / Vite 类型检查
npm run worker:typecheck  # 根据 Wrangler 配置生成类型并检查 Worker
npm run build             # 生产构建
```

Worker 类型检查需要先安装根目录与 Worker 两处依赖；生成文件位于已忽略的 `.wrangler/` 中。

## 在线音乐

Navbar 的音乐按钮展开播放器；关闭面板和客户端路由切换不会中断播放。音频由应用根层的原生 `Audio` 实例播放，首次打开面板才请求歌单，不自动播放，也不需要本地音乐文件。

在 `.env.local` 中设置以下值后重启开发服务（生产环境需重新构建）：

```dotenv
VITE_METING_API=https://api.qijieya.cn/meting/
VITE_METING_SERVER=netease
VITE_METING_PLAYLIST_ID=2779302837
```

默认使用 [网易云歌单 2779302837](https://music.163.com/#/playlist?id=2779302837)。`VITE_METING_API` 填完整的 HTTP(S) API 基础地址，代码添加 `server`、`type=playlist`、`id` 查询参数；兼容 `name/artist` 和 `title/author` 两种返回字段。自建服务需允许博客域名跨域访问，HTTPS 博客应使用 HTTPS API 和媒体地址。公开服务和歌曲链接的可用性取决于服务提供方，失败时面板提供重新加载或切歌操作。

## 代码约定

- 前端、构建配置、Worker 分别由各自的 TypeScript 配置检查；前端与 Worker 启用严格模式和未使用代码检查。
- React 文章列表加载复用 `src/hooks/useArticles.ts`，组件卸载时中止请求。API 返回空列表时保持为空；网络异常仍沿用原有示例文章回退行为。
- 主题、语言与加载动画通过 `src/utils/storage.ts` 读写偏好，浏览器禁止存储时回退到当前页面内存。
- 文章发布数据先经 `workers/content/src/validation.ts` 校验，再写入数据库。无效载荷返回 400；发布仍需 `x-publish-secret`。
- Markdown 解析只维护在 Worker 中；本地脚本监听到连续变化时串行发布，避免并发覆盖同步清单。
- 主题变量 CSS 由 `src/config/theme.config.ts` 生成，不直接修改生成文件。

## 仓库清理约定

- `node_modules/`、构建产物和工具缓存不纳入版本控制；依赖通过对应目录的 `package.json` 与锁文件恢复。
- 删除资源前检查源码、主题配置、CSS、脚本和部署配置的引用。字体生成源、`public/_redirects` 等文件即使不被组件直接导入，也可能仍有用途。
- 组件使用实际需要的导入入口，不保留无人引用的集中导出文件；删除功能时同步清理无调用的函数、翻译和样式。
- 仅用于开发或构建的依赖放入 `devDependencies`。根目录与 Worker 的依赖分别维护，跨目录使用需要保留明确的依赖声明。
- 清理后运行类型检查和生产构建；不因“当前未展示”删除错误回退、主题选项或内容发布入口。

## 后续质量事项

目前构建可以通过，文章详情 JavaScript 包仍有超过 500 kB 的提示，可后续评估代码高亮语言裁剪。站名字体已使用 WOFF2 子集，原始 TTF 保留为生成源，不进入生产构建。

内容服务的部署与发布配置见 [Worker 说明](workers/content/README.md)。

## 主题维护

- `src/config/theme.config.ts` 是统一注册入口，五套风格分别位于 `src/config/themes/`，公共变量与类型位于 `tokens.ts`。新增风格文件并注册时提供唯一 `id`、中英文名称、`cardCss`、完整 `light` 和增量 `dark`，可选 `video`。变量使用 CSS 名称（例如 `main-color`），由 `ThemeTokens` 检查必要字段；通常从 `defaultLight` / `defaultDark` 展开再覆盖。
- 深色解析规则为 `light + dark`；希望采用通用深色配色时，在 `dark` 中展开 `defaultDark`。每套风格均提供 `bg-0` 到 `bg-3`。
- `src/theme/model.ts` 统一默认值、偏好校验和变量解析；`src/theme/build.ts` 生成 CSS 与首屏脚本。开发时修改其依赖会触发 Vite 配置重载并重新生成，生产构建使用同一入口。不要手动编辑 `src/styles/theme-vars.css`。
- `themeStore.ts` 管理用户模式、实际深浅色和视觉风格，使用 `useSyncExternalStore` 订阅。读取实际颜色模式请使用 `useTheme().effectiveTheme`。旧存储键 `theme`、`card-style` 保持兼容。
- `<div data-card>` 跟随全局卡片风格；`<div data-card="base">` 固定卡片外观，但仍使用当前全局配色。两类规则不叠加。全局深浅色只使用 `data-theme`，不再维护 `.dark-mode`。
- 首屏和运行时均设置 `data-theme`、`data-card-style`、`color-scheme` 与 `theme-color`。系统模式变化、跨标签页偏好变更会同步；禁止存储时当前页面仍可切换。

主题注册表在构建时校验：ID 必须唯一且使用小写字母、数字或连字符（字母开头）；默认风格必须存在；变量不能缺失、为空或包含未知名称。菜单只在展开时订阅外部指针和键盘事件，Tab 离开后自动关闭。重复选择不会重复写入偏好或 DOM，仅订阅卡片风格的组件不会因深浅色变化而重新渲染。

主题面板使用双列预览，按视口宽高限制位置及滚动区域。预览通过 `data-card` 复用生成的卡片 CSS，不再单独注入样式。减少动态效果时禁用主题面板缩放、卡片过渡与首页背景视频；视频加载或播放失败保留静态背景。

## CSS 变量层级

权威定义与每项用途见 `src/config/themes/tokens.ts`。`bg-0` 是页面底色，`bg-1` 是主表面（卡片、导航），`bg-2` 是内嵌区域（输入框、控件槽），`bg-3` 是浮层（菜单、抽屉）。编号不是 DOM 深度或 z-index，也不要求每套主题数值严格递增。`text-1` 用于标题/正文/主要操作，`text-2` 用于摘要/说明，`text-3` 用于作者/时间等元信息；普通文字不再叠加静态 opacity。动画与禁用状态的 opacity 不受此限制。

`main-color` 用于强调色、链接与选中态；`on-main` 是强调色实心背景上的文字/图标。`border` 是完整边框值，不能用作 border-color；`box-shadow` 是表面阴影。图片上的文字、品牌徽章与 Neo 的硬轮廓是有意保留的局部例外。透明度由主题表面控制，不给整张卡片再乘 opacity。

颜色变量不得放入渐变或图片。完整区域背景使用 `main-bg`、`home-bg`、`footer-bg`，`home-bg-filter` 是遮罩颜色，纯色 `bg-0` 提供兜底与浏览器顶栏色。Glass 使用暖纸米灰浅色与暖炭灰深色。

有 Hero 的页面在 MainContent 顶部显示双层缓波：前浪与正文共用 `main-bg` 背景层，`wave-bg` 单独配置后浪颜色与透明度。波浪高度在 `MainLayout.tsx` 中设置（桌面 64px，手机 40px），只改变背景边缘，不移动正文或随滚动改变 navbar 配色。

Markdown 的颜色与装饰沿用原有样式。`link-color`、`accent-soft`、`accent-border`、`accent-glow`、`table-stripe` 仅保留既有兼容定义，通用组件不再引入这些派生变量。

## 字体与排版

### 统一入口与字体角色

- 字体、字号、字重和行高统一维护在 [`src/styles/typography.css`](src/styles/typography.css)。组件引用语义变量，五套主题共用，不在主题配置中覆盖字号或为单个页面另建字号体系。
- 正文、标题和控件使用 `--font-body`（Nunito + 霞鹜文楷）；站名使用 `--font-brand`（Outfit + TianTianQuan）；代码使用 `--font-code`（系统等宽字体栈）。保留系统回退字体。
- 正常文字使用 `--weight-regular`（400），标题与强调使用 `--weight-strong`（700）。站名和导航保持 400，导航选中态通过颜色、背景表达，避免文字宽度跳动。
- 新组件优先使用上述变量；`--content-font`、`--title-font`、`--site-title-font` 仅作为现有组件的兼容别名。

### 字号、行高与单位

下表的 px 数值仅用于理解视觉大小，对应浏览器默认根字号 16px；实际样式使用变量。

| 用途 | 字号变量 | 默认大小 | 行高变量 |
| --- | --- | --- | --- |
| 页面 / 文章主标题 | `--text-page-title` | 28–32px | `--leading-heading`（1.3） |
| 文章卡片标题 | `--text-card-title` | 20–24px | `--leading-title`（1.4） |
| 站名 / 统计数字 | `--text-brand` | 20–24px | `--leading-heading`（1.3） |
| 模块标题 | `--text-section` | 18px | `--leading-ui`（1.5） |
| 文章正文 | `--text-reading` | 16–18px | `--leading-reading`（1.9） |
| 普通正文 / 导航 / 编辑控件 | `--text-body` | 16px | `--leading-body`（1.6）；控件用 `--leading-ui`（1.5） |
| 摘要 / 菜单 / 作者 / 日期 | `--text-meta` | 14px | `--leading-ui` / `--leading-body`（1.5–1.6） |
| 标签 / 紧凑注释 | `--text-caption` | 12px | `--leading-ui`（1.5） |
| 代码块 | `--text-meta` | 14px | `--leading-code`（1.7） |

- `html` 保持 `font-size: 100%`，尊重用户默认字号，不通过缩小根字号适配手机。
- 文字字号和布局断点用 `rem`；随当前文字缩放的图标、内联代码等用 `em`；边框、阴影等细节可用 `px`。行高使用无单位数值。
- 流式字号使用带 `rem` 上下限的 `clamp()`，不单独使用 `vw` 设置文字大小。新增字号层级先补充全局变量及规范，再在组件中使用。
- `button`、`input`、`select`、`textarea` 继承页面字体；编辑控件维持 `1rem`。不要用缩小文字解决控件拥挤。

### 响应式与内容边界

- 页面标题、站名和文章正文随视口连续变化；文章卡片按自身容器适配，宽度不超过 `48rem` 时改为纵向，标题根据文字区域宽度缩放。
- 首页默认三列，不超过 `48rem` 时双列，不超过 `30rem` 时单列。卡片允许随内容增高，避免固定高度裁掉文字。
- 文章阅读区域最大宽度使用 `--reading-width`（42rem），正文保留自然字距。Markdown 各级标题引用 `--text-article-h1`、`--text-article-h2`、`--text-article-h3` 和 `--text-section`。
- 导航在空间不足时折叠；标签、元信息和页脚徽章允许换行。长单词使用 `overflow-wrap: anywhere`；表格和代码块在自己的容器内横向滚动，不撑宽整页。
- 文章卡片标题最多两行、摘要最多三行；详情标题和正文完整显示。省略仅用于列表预览，不用于隐藏详情内容或必要操作。

### 资源维护与验收

字体通过锁定版本的 npm 包随 Vite 构建同源托管，使用 `font-display: swap`；文楷保留 `unicode-range` 分片，不重新加入远程字体 CSS。字体许可源文件位于 `public/fonts/licenses/`，构建后通过 `/fonts/licenses/` 访问。

站名使用预生成的 WOFF2 子集。修改 `src/config/site.ts` 中的中英文站名后，安装 fontTools 并运行 `npm run fonts:brand`，同时提交生成的字体文件；日常开发和构建不依赖 Python。完整命令见 [排版规范：字体资源维护](docs/typography.md#字体资源维护)。

涉及排版的改动应运行 `npm run typecheck` 和 `npm run build`，并检查中英文、深浅色、五套主题及 320–1440px 的代表性视口。视觉验收还应覆盖 200% 页面缩放、长标题、菜单、输入框、表格和代码块，确认文字可读、控件不重叠、页面没有意外横向溢出。完整变量和维护细节见 [排版规范](docs/typography.md)。
