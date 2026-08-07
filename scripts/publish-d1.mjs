#!/usr/bin/env node
/**
 * publish-d1.mjs — 把 Obsidian 文章发布到 Cloudflare D1（通过内容 Worker）
 *
 * 用法：
 *   node scripts/publish-d1.mjs sync              增量发布：只发送新增/修改的文件
 *   node scripts/publish-d1.mjs sync --full       强制全量发布
 *   node scripts/publish-d1.mjs sync --dry-run    预览（只列变化，不联网）
 *   node scripts/publish-d1.mjs watch             监听内容变更，防抖后增量发布
 *
 * 增量原理：在 <vault>/_posts/.oblivion-state.json 里记录每篇文章的内容哈希，
 * 每次发布只对比哈希，把有变化的文件发给 Worker；被删掉的文件单独标记删除。
 * 哈希清单跟随 iCloud 同步，换电脑不丢。
 *
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
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
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
const MANIFEST_FILE = process.env.CONTENT_MANIFEST || join(POSTS_DIR, '.oblivion-state.json');
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

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
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

// ── 增量清单 ─────────────────────────────────────────
async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_FILE, 'utf8'));
  } catch {
    return {};
  }
}

async function writeManifest(map) {
  await writeFile(MANIFEST_FILE, JSON.stringify(map, null, 2) + '\n', 'utf8');
}

// ── 发布 ─────────────────────────────────────────────
async function publish(forceFull = false) {
  const files = await listMarkdown(POSTS_DIR);
  const manifest = await readManifest();
  const currentPaths = new Set(files.map((abs) => toPosixPath(relative(POSTS_DIR, abs))));

  // 找出新增/修改的文件（全量模式下全部视为变更）
  const payloadFiles = [];
  for (const absPath of files) {
    const rel = toPosixPath(relative(POSTS_DIR, absPath));
    const raw = await readFile(absPath, 'utf8');
    if (forceFull || manifest[rel] !== sha256(raw)) {
      payloadFiles.push({ path: rel, content: raw });
    }
  }

  // 找出已从磁盘消失的文件（清单里有、磁盘上没有）
  const deletedPaths = Object.keys(manifest).filter((k) => !currentPaths.has(k));

  // 预览模式：只打印变化，不联网、不写清单
  if (DRY_RUN) {
    const added = payloadFiles.filter((f) => !(f.path in manifest)).map((f) => f.path);
    const modified = payloadFiles.filter((f) => f.path in manifest).map((f) => f.path);
    console.log(yellow('⟳ 预览模式（未发布任何内容）'));
    console.log(dim(`  新增 ${added.length}，修改 ${modified.length}，删除 ${deletedPaths.length}`));
    for (const p of added) console.log(`  + ${cyan(p)}`);
    for (const p of modified) console.log(`  ~ ${cyan(p)}`);
    for (const p of deletedPaths) console.log(`  - ${cyan(p)}`);
    return null;
  }

  if (payloadFiles.length === 0 && deletedPaths.length === 0) {
    console.log(green('✓ 没有变化，无需发布'));
    return { published: 0, deleted: 0 };
  }

  const res = await fetch(`${WORKER_URL}/api/publish-raw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publish-secret': PUBLISH_SECRET,
    },
    body: JSON.stringify({
      files: payloadFiles,
      deletedPaths,
      fullSync: forceFull,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`发布失败: HTTP ${res.status} ${text.slice(0, 300)}`);
  }

  const result = await res.json();

  // 成功后才更新清单
  const nextManifest = { ...manifest };
  for (const f of payloadFiles) nextManifest[f.path] = sha256(f.content);
  for (const p of deletedPaths) delete nextManifest[p];
  await writeManifest(nextManifest);

  console.log(green(`✓ 已发布 ${payloadFiles.length} 篇（写入 ${result.published}，清理 ${result.deleted}）`));
  return result;
}

// ── 监听模式 ─────────────────────────────────────────
function startWatch() {
  console.log('');
  console.log(green('╔══════════════════════════════════════════╗'));
  console.log(green('║') + '   📝 D1 Content Publish 已启动（增量）      ' + green('║'));
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
          await publish(false);
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
const FORCE_FULL = process.argv.includes('--full');
if (cmd === 'sync') {
  publish(FORCE_FULL).catch((err) => {
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
