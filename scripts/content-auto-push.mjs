#!/usr/bin/env node

/**
 * content-auto-push.mjs
 * 
 * 监听 src/content 目录下的文件变动，自动执行 git add → commit → push。
 * 
 * 用法：
 *   node scripts/content-auto-push.mjs          # 直接运行
 *   npm run content:watch                        # 通过 npm script 运行
 * 
 * 特性：
 *   - 使用 fs.watch 递归监听，零外部依赖
 *   - 2 秒防抖：连续保存只触发一次提交
 *   - 自动生成带时间戳和变更文件列表的 commit message
 *   - 上传失败时仅打印警告，不中断监听
 */

import { watch } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, relative } from 'node:path';

// ── 配置 ─────────────────────────────────────────────
const PROJECT_ROOT = resolve(import.meta.dirname, '..');
const WATCH_DIR = resolve(PROJECT_ROOT, 'src/content');
const DEBOUNCE_MS = 2000; // 防抖延迟（毫秒）
const REMOTE = 'origin';
const BRANCH = 'main';

// ── 状态 ─────────────────────────────────────────────
let debounceTimer = null;
const changedFiles = new Set();

// ── 颜色辅助 ─────────────────────────────────────────
const cyan    = (s) => `\x1b[36m${s}\x1b[0m`;
const green   = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow  = (s) => `\x1b[33m${s}\x1b[0m`;
const red     = (s) => `\x1b[31m${s}\x1b[0m`;
const dim     = (s) => `\x1b[2m${s}\x1b[0m`;

// ── 核心：提交并推送 ──────────────────────────────────
function commitAndPush() {
  const files = [...changedFiles];
  changedFiles.clear();

  try {
    // git add
    execSync('git add src/content/', { cwd: PROJECT_ROOT });

    // 构造 commit message
    const now = new Date().toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const fileList = files.map((f) => relative(WATCH_DIR, f)).join(', ');
    const message = `content: 自动更新 (${now})\n\n变更文件: ${fileList}`;

    execSync(`git commit -m ${JSON.stringify(message)}`, { cwd: PROJECT_ROOT });
    console.log(green('  ✓ 已提交'));

    // git push
    execSync(`git push ${REMOTE} ${BRANCH}`, { cwd: PROJECT_ROOT, stdio: 'pipe' });
    console.log(green(`  ✓ 已推送至 ${REMOTE}/${BRANCH}`));
  } catch (err) {
    console.error(red('  ✗ 提交/推送失败:'), err.message);
  }
}

// ── 防抖处理 ──────────────────────────────────────────
function onFileChange(eventType, filename) {
  if (!filename) return;

  // 只监听 markdown 文件
  if (!filename.endsWith('.md')) return;

  // 忽略隐藏文件和临时文件
  if (filename.startsWith('.') || filename.endsWith('~') || filename.endsWith('.swp')) {
    return;
  }

  const fullPath = resolve(WATCH_DIR, filename);
  changedFiles.add(fullPath);

  console.log(cyan(`  ● 检测到变更: ${filename}`));

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log(yellow('\n⟳ 开始提交并推送...'));
    commitAndPush();
    console.log(dim('─'.repeat(40)));
  }, DEBOUNCE_MS);
}

// ── 启动监听 ──────────────────────────────────────────
console.log('');
console.log(green('╔══════════════════════════════════════════╗'));
console.log(green('║') + '   📝 Content Auto-Push 已启动            ' + green('║'));
console.log(green('╠══════════════════════════════════════════╣'));
console.log(green('║') + `   监听目录: ${cyan('src/content/')}               ` + green('║'));
console.log(green('║') + `   远程仓库: ${cyan(`${REMOTE}/${BRANCH}`)}             ` + green('║'));
console.log(green('║') + `   防抖延迟: ${cyan(`${DEBOUNCE_MS}ms`)}                    ` + green('║'));
console.log(green('╠══════════════════════════════════════════╣'));
console.log(green('║') + '   按 Ctrl+C 停止                          ' + green('║'));
console.log(green('╚══════════════════════════════════════════╝'));
console.log('');

try {
  watch(WATCH_DIR, { recursive: true }, onFileChange);
} catch (err) {
  console.error(red('无法启动文件监听:'), err.message);
  process.exit(1);
}

// 优雅退出
process.on('SIGINT', () => {
  console.log(dim('\n\n👋 Content Auto-Push 已停止'));
  process.exit(0);
});
