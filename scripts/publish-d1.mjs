#!/usr/bin/env node
/**
 * publish-d1.mjs — 把 Obsidian 文章发布到 Cloudflare D1（通过内容 Worker）
 *
 * 用法：
 *   node scripts/publish-d1.mjs sync      全量发布：所有 .md 发给 Worker
 *   node scripts/publish-d1.mjs watch     监听内容变更，防抖后全量发布
 *   node scripts/publish-d1.mjs sync --dry-run   预览（只列文件，不联网）
 *
 * 本脚本只负责"发送原始 Markdown"：解析 frontmatter、双语正文、
 * 以及文章 ID 的分配/保持，全部由 Worker 在 D1 里完成。
 * 真实文件路径（目录/文件名）只作为内部 source_path 存进数据库，
 * 永远不会出现在任何公开接口响应中。
 *
 * 配置（项目根目录 .env，模板见 .env.example）：
 *   CONTENT_DIR       Obsidian vault 路径（默认 ../Oblivion-Content）
 *   POSTS_SUBDIR      vault 里文章子目录（默认 posts，兼容旧 R2_POSTS_SUBDIR）
 *   WORKER_URL        内容 Worker 地址，如 https://oblivion-content.xxx.workers.dev
 *   PUBLISH_SECRET    与 Worker 的 PUBLISH_SECRET 一致
 */

import { watch } from 'node:fs';
import { readFileSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative, dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

// ── 读取 .env（避免额外依赖） ─────────────────────────────
try {
  const raw = readFileSync(join(PROJECT_ROOT, '.env'), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    // 已存在的环境变量（如命令行传入）优先，不覆盖
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {
  // .env 不存在时直接使用系统环境变量
}

// ── 配置 ─────────────────────────────────────────────
const CONTENT_DIR = resolve(PROJECT_ROOT, process.env.CONTENT_DIR || '../Oblivion-Content');
const POSTS_SUBDIR = process.env.POSTS_SUBDIR || process.env.R2_POSTS_SUBDIR || 'posts';
const POSTS_DIR = join(CONTENT_DIR, POSTS_SUBDIR);
const WORKER_URL = (process.env.WORKER_URL || '').replace(/\/+$/, '');
const PUBLISH_SECRET = process.env.PUBLISH_SECRET;

const missing = ['WORKER_URL', 'PUBLISH_SECRET'].filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(
    '❌ 缺少配置:',
    missing.join(', '),
    '—— 请先在 .env 填写（部署 Worker 后设置 PUBLISH_SECRET）',
  );
  process.exit(1);
}

// ── 颜色辅助 ─────────────────────────────────────────
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

function toPosixPath(p) {
  return p.split(sep).join('/');
}

async function listMarkdown(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listMarkdown(p)));
    else if (entry.name.endsWith('.md')) out.push(p);
  }
  return out;
}

// ── 发布 ─────────────────────────────────────────────
async function publish() {
  const files = await listMarkdown(POSTS_DIR);
  const payload = {
    files: await Promise.all(
      files.map(async (absPath) => ({
        path: toPosixPath(relative(POSTS_DIR, absPath)),
        content: await readFile(absPath, 'utf8'),
      })),
    ),
  };

  // 预览模式：只打印将要发布的文件，不联网
  if (DRY_RUN) {
    console.log(yellow('⟳ 预览模式（未发布任何内容）'));
    console.log(dim(`  发现 ${payload.files.length} 篇 Markdown`));
    for (const f of payload.files) console.log(`  ${cyan(f.path)}`);
    return null;
  }

  const res = await fetch(`${WORKER_URL}/api/publish-raw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publish-secret': PUBLISH_SECRET,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`发布失败: HTTP ${res.status} ${text.slice(0, 300)}`);
  }

  const result = await res.json();
  console.log(green(`✓ 已发布 ${payload.files.length} 篇（写入 ${result.published}，清理 ${result.deleted}）`));
  return result;
}

// ── 监听模式 ─────────────────────────────────────────
function startWatch() {
  console.log('');
  console.log(green('╔══════════════════════════════════════════╗'));
  console.log(green('║') + '   📝 D1 Content Publish 已启动            ' + green('║'));
  console.log(green('╠══════════════════════════════════════════╣'));
  console.log(green('║') + `   监听目录: ${cyan(POSTS_DIR)}` + green('║'));
  console.log(green('║') + `   发布地址: ${cyan(WORKER_URL)}` + green('║'));
  console.log(green('╠══════════════════════════════════════════╣'));
  console.log(green('║') + '   按 Ctrl+C 停止                          ' + green('║'));
  console.log(green('╚══════════════════════════════════════════╝'));
  console.log('');

  let debounceTimer = null;
  try {
    watch(POSTS_DIR, { recursive: true }, (eventType, filename) => {
      if (!filename || !filename.endsWith('.md')) return;
      if (filename.startsWith('.') || filename.includes('/.')) return;
      console.log(cyan(`  ● 检测到变更: ${filename}`));
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        console.log(yellow('\n⟳ 开始发布...'));
        try {
          await publish();
        } catch (err) {
          console.error(red('  ✗ 发布失败:'), err.message);
        }
        console.log(dim('─'.repeat(40)));
      }, 2000);
    });
  } catch (err) {
    console.error(red('无法启动文件监听:'), err.message);
    process.exit(1);
  }
}

// ── 入口 ─────────────────────────────────────────────
const cmd = process.argv[2] || 'sync';
const DRY_RUN = process.argv.includes('--dry-run');
if (cmd === 'sync') {
  publish().catch((err) => {
    console.error(red('发布失败:'), err.message);
    process.exit(1);
  });
} else if (cmd === 'watch') {
  startWatch();
} else {
  console.error(`未知命令: ${cmd}（可用: sync / watch）`);
  process.exit(1);
}

process.on('SIGINT', () => {
  console.log(dim('\n\n👋 D1 Content Publish 已停止'));
  process.exit(0);
});
