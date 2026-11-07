# 字体与响应式排版

`src/styles/typography.css` 是字体、字号、字重、行高的唯一配置入口；五套视觉主题共用。组件通过语义变量引用，不在主题配置中覆盖字号。

## 字体和字重

| 用途 | 变量 | 字体 |
| --- | --- | --- |
| 常规文字、标题、控件 | `--font-body` | Nunito + LXGW WenKai + 系统回退 |
| 导航站名 | `--font-brand` | Outfit + TianTianQuan + 正文回退 |
| 代码 | `--font-code` | 系统等宽字体栈 |

常规文字使用 `--weight-regular`（400），标题与强调使用 `--weight-strong`（700）。站名使用 400，导航选中态使用颜色和背景表达，避免字重改变导致宽度跳动。

`--content-font`、`--title-font`、`--site-title-font` 是兼容旧组件的别名。新组件优先使用上表中的变量。

## 字号和行高

像素值仅对应浏览器默认根字号 16px。`html` 保持 `font-size: 100%`，尊重用户的默认字号。

| 角色 | 变量 | 默认范围 | 行高 |
| --- | --- | --- | --- |
| 页面 / 文章主标题 | `--text-page-title` | 28–32px | `--leading-heading`（1.3） |
| 文章卡片标题 | `--text-card-title` | 20–24px | `--leading-title`（1.4） |
| 站名 / 统计数字 | `--text-brand` | 20–24px | 1.3 |
| 模块标题 | `--text-section` | 18px | `--leading-ui`（1.5） |
| 文章正文 | `--text-reading` | 16–18px | `--leading-reading`（1.9） |
| 普通正文 / 导航 / 编辑控件 | `--text-body` | 16px | `--leading-body`（1.6） |
| 摘要 / 菜单 / 作者 / 日期 | `--text-meta` | 14px | 1.5–1.6 |
| 标签 / 紧凑注释 | `--text-caption` | 12px | 1.5 |
| 代码块 | `--text-meta` | 14px | `--leading-code`（1.7） |

文字字号与布局断点使用 rem；与当前文字相关的尺寸使用 em；边框、阴影和图标可保留独立尺寸。图标字号、代码的相对字号与上下标不属于普通文字字号层级。

## 响应式规则

- 页面标题、正文和站名通过 `clamp()` 连续变化，并具有 rem 上下限。根字号不随视口缩小。
- 文章卡片以自身为具名容器：48rem 以下改为纵向，标题在文字区域内按容器宽度缩放；不支持 cqi 时使用 1.25rem 回退。
- 首页在 48rem 以下使用双列，30rem 以下使用单列，日历与卡片高度允许随内容增长。
- 编辑控件维持 1rem，菜单通过折叠、换行和滚动适配；标签、元信息和页脚徽章允许换行。
- 文章正文最大宽度为 `--reading-width`（42rem）。表格和代码块在自己的区域横向滚动。
- 卡片标题最多两行、摘要最多三行；详情标题与正文完整显示。长单词和标签使用 `overflow-wrap: anywhere`。

Markdown H1 为 24–28px，H2 为 22–24px，H3 为 20px，H4–H6 为 18px。正文采用自然字距、1em 段距和标题上大下小的间距；原有颜色与装饰继续由 `markdown.css` 管理。

## 字体资源维护

Nunito、Outfit 和文楷来自锁定版本的 npm 字体包，由 Vite 输出同源资源。文楷按 Regular / Bold 引入，保留 `unicode-range` 分片，浏览器按实际字符加载。各字体使用 `font-display: swap`。相关许可随构建发布在 `/fonts/licenses/`。

站名使用 `TianTianQuan-brand.woff2` 子集，原始 TTF 保留为生成源，不进入生产构建。修改 `src/config/site.ts` 的 `name` 后重新生成：

```sh
python3 -m venv /tmp/oblivion-font-tools
/tmp/oblivion-font-tools/bin/python -m pip install 'fonttools[woff]'
FONTTOOLS_PYTHON=/tmp/oblivion-font-tools/bin/python npm run fonts:brand
```

生成脚本直接读取中英文站名。提交生成的 WOFF2 即可，日常开发和生产构建不需要 Python。站名出现未包含的字符时使用正文回退字体。

## 验收

运行 `npm run typecheck` 和 `npm run build`。视觉检查覆盖中英文、深浅色、五套主题，以及 320 / 360 / 390 / 480 / 768 / 1024 / 1280 / 1440px 的代表性视口。检查窗口连续缩放、200% 页面缩放、长标题、菜单、输入框、表格与代码块，确认文字可读、控件没有重叠、页面没有意外横向溢出。
