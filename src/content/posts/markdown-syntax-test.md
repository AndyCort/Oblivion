---
title: "Markdown 全语法测试与展示指南"
summary: "这是一篇包含几乎所有常见 Markdown 语法格式的综合测试文章，用于检验解析器（如 marked）的渲染能力及自定义样式的覆盖情况。"
date: "2026-07-24"
tags: ["Markdown", "测试", "排版", "前端开发"]
cover: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80"
---

# 欢迎来到 Markdown 全语法测试页

这是一段普通的正文段落。Markdown 是一种轻量级标记语言，它允许人们使用易读易写的纯文本格式编写文档。接下来我们将展示各种支持的排版效果。

---

## 1. 文本样式与修饰

我们可以混合使用多种文本修饰：
- 这是 **加粗文本 (Bold)** 和 *斜体文本 (Italic)*。
- 这是 ***加粗且斜体的文本***。
- 这是 ~~被删除的文本 (Strikethrough)~~。
- 在部分支持的扩展语法中，还有 ==高亮文本== 和 ^上标^ 与 ~下标~，但在标准 Markdown 中通常通过 HTML 实现，比如 <u>下划线文本</u>。

## 2. 列表结构

### 无序列表 (Unordered List)
* 苹果 (Apple)
* 香蕉 (Banana)
  * 熟透的香蕉
  * 青涩的香蕉
* 橘子 (Orange)

### 有序列表 (Ordered List)
1. 第一步：打开冰箱门
2. 第二步：把大象装进去
   1. 注意调整大象的姿势
   2. 小心不要碰到其他食物
3. 第三步：关上冰箱门

### 任务列表 (Task List)
- [x] 完成 Markdown 基础语法学习
- [x] 安装并配置 `marked` 渲染引擎
- [ ] 优化站点的全局 CSS 排版样式
- [ ] 部署到 Cloudflare Pages

---

## 3. 引用块 (Blockquotes)

引用可以用来说明某段文字的来源或者强调特定的内容：

> “世上本没有路，走的人多了，也便成了路。” 
> —— 鲁迅《故乡》

甚至可以进行**嵌套引用**：

> 外层引用段落
> > 内层嵌套的引用段落
> > 它可以一直嵌套下去。

---

## 4. 代码展示

### 行内代码 (Inline Code)
你可以使用 `console.log('Hello World')` 来在控制台输出信息。或者使用 `document.getElementById('app')`。

### 代码块 (Code Blocks)
下面是一段带有语法高亮的 TypeScript 代码块：

```typescript
// 这是一个 TypeScript 函数示例
interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

async function fetchUserData(userId: number): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('User not found');
  }
  return response.json();
}

console.log("TypeScript is awesome!");
```

下面是一段 CSS 样式示例：

```css
/* 自定义详情页的标题样式 */
.article-detail h2 {
  color: var(--main-color);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
  margin-top: 2rem;
}
```

---

## 5. 链接与多媒体

### 超链接 (Links)
- 基本链接：[GitHub 官网](https://github.com)
- 带 Title 的链接：[点击访问 Google](https://google.com "全球最大的搜索引擎")
- 直接展示 URL：<https://astro.build>

### 图片 (Images)
下面插入了一张网络图片：

![美丽的自然风景](https://images.unsplash.com/photo-1506744626753-eda8151a74a1?auto=format&fit=crop&w=800&q=80 "这是一张由 Unsplash 提供的风景图")

---

## 6. 表格 (Tables)

表格是非常实用的数据展示方式。支持对齐方式配置（左侧、居中、右侧）。

| 框架名称 | 语言 | 类型 | GitHub Stars |
| :--- | :---: | :---: | ---: |
| React | JavaScript/TypeScript | UI 库 | ~210k |
| Vue | JavaScript/TypeScript | 框架 | ~205k |
| Astro | JavaScript/TypeScript | 框架 (SSG) | ~40k |
| Svelte | JavaScript/TypeScript | 编译器 | ~75k |

---

## 7. 分隔线 (Horizontal Rules)

在文章的不同章节之间，你可以使用分隔线来隔开它们：

***

上面是一条分隔线。下面是另一条分隔线：

___

## 8. HTML 内联元素

如果在 Markdown 语法不够用的情况下，你可以直接写 HTML 标签（`marked` 解析器默认兼容安全的 HTML）。
例如：<span style="color: red; font-weight: bold;">这是一段红色的警告文本。</span>
还有，<kbd>Ctrl</kbd> + <kbd>C</kbd> 是复制的快捷键。

---

## 结语

恭喜！如果你能看到以上所有元素（包括加粗、斜体、各级标题、列表、代码高亮、引用、图片与表格）都排版规整且清晰可读，说明你的 Markdown 渲染器（`marked`）和站点的 CSS 样式都已经完美配置成功了！
