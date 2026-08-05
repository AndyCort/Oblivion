#!/usr/bin/env node
/**
 * r2-sync.mjs — 把 Obsidian 内容同步到 Cloudflare R2
 *
 * 用法：
 *   node scripts/r2-sync.mjs sync     全量同步：上传所有 .md + 重建 index.json + 清理已删除的文章
 *   node scripts/r2-sync.mjs watch    监听内容变更，防抖后增量上传 + 重建 index.json
 *
 * 双语正文格式（title/summary 同样支持 { zh, en }）：
 *   ---
 *   title:
 *     zh: 中文标题
 *     en: English Title
 *   ---
 *   <!-- zh -->
 *   中文正文……
 *   <!-- /zh -->
 *
 *   <!-- en -->
 *   English body……
 *   <!-- /en -->
 *
 * 配置（项目根目录 .env，模板见 .env.example）：
 *   R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET
 *   CONTENT_DIR（可选，默认 ../Oblivion-Content，可指向任意 vault 位置）
 */

import { watch } from 'node:fs';
import { readFileSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

// ── 读取 .env（避免额外依赖） ─────────────────────────────
try {
  const raw = readFileSync(join(PROJECT_ROOT, '.env'), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {
  // .env 不存在时直接使用系统环境变量
}

// ── 配置 ─────────────────────────────────────────────
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET;
const R2_ENDPOINT = process.env.R2_ENDPOINT || `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;
const CONTENT_DIR = resolve(PROJECT_ROOT, process.env.CONTENT_DIR || '../Oblivion-Content');
const POSTS_SUBDIR = process.env.R2_POSTS_SUBDIR || 'posts';
const POSTS_DIR = join(CONTENT_DIR, POSTS_SUBDIR);

const missing = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'].filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error('❌ 缺少配置:', missing.join(', '), '—— 请先参照 .env.example 填写 .env');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  forcePathStyle: true,
  credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
});

// ── 颜色辅助 ─────────────────────────────────────────
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

// ── Markdown 解析（与前端 mdArticles.ts 保持一致） ───────────
const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

function parseFrontmatter(rawContent) {
  const fmMatch = rawContent.match(FRONTMATTER_REGEX);
  if (!fmMatch) return { frontmatter: {}, content: rawContent };
  try {
    return { frontmatter: parseYaml(fmMatch[1]) || {}, content: fmMatch[2] };
  } catch {
    return { frontmatter: {}, content: fmMatch[2] };
  }
}

function keepLocalized(field) {
  if (field && typeof field === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(field)) {
      if (typeof value === 'string' && value.trim()) out[key] = value;
    }
    return Object.keys(out).length > 0 ? out : null;
  }
  return null;
}

function toPosixPath(p) {
  return p.split(sep).join('/');
}

async function buildArticleMeta(absPath) {
  const rel = toPosixPath(relative(POSTS_DIR, absPath));
  const raw = await readFile(absPath, 'utf8');
  const { frontmatter, content } = parseFrontmatter(raw);
  const filename = rel.split('/').pop().replace(/\.md$/, '');
  const title = keepLocalized(frontmatter.title) || (typeof frontmatter.title === 'string' && frontmatter.title.trim() ? frontmatter.title : filename);
  return {
    id: filename,
    path: `posts/${rel}`,
    title,
    summary: keepLocalized(frontmatter.summary) || (typeof frontmatter.summary === 'string' ? frontmatter.summary : ''),
    author: frontmatter.author || '',
    date: frontmatter.date || new Date().toISOString().split('T')[0],
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    cover: frontmatter.cover || '',
    pinned: !!frontmatter.pinned || !!frontmatter.top,
    chars: content.length,
  };
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

async function buildIndex() {
  const files = await listMarkdown(POSTS_DIR);
  const metas = await Promise.all(files.map(buildArticleMeta));
  metas.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  return { updatedAt: new Date().toISOString(), articles: metas };
}

// ── R2 操作 ─────────────────────────────────────────
async function putObject(key, body, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: Buffer.from(body),
      ContentType: contentType,
    }),
  );
}

async function deleteObject(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

async function listBucketKeys(prefix) {
  const keys = [];
  let token;
  do {
    const res = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix, ContinuationToken: token }),
    );
    for (const obj of res.Contents || []) keys.push(obj.Key);
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

// 并发上传，限制同时进行的数量
async function mapLimit(items, limit, fn) {
  const results = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return results;
}

// ── 核心同步 ─────────────────────────────────────────
async function syncArticleFile(absPath) {
  const rel = toPosixPath(relative(POSTS_DIR, absPath));
  const raw = await readFile(absPath, 'utf8');
  await putObject(`posts/${rel}`, raw, 'text/markdown; charset=utf-8');
  console.log(green('  ✓ 上传'), cyan(`posts/${rel}`));
}

async function removeArticleFile(absPath) {
  const rel = toPosixPath(relative(POSTS_DIR, absPath));
  await deleteObject(`posts/${rel}`);
  console.log(yellow('  - 删除'), cyan(`posts/${rel}`));
}

async function publishIndex() {
  const index = await buildIndex();
  await putObject('index.json', JSON.stringify(index, null, 2), 'application/json; charset=utf-8');
  console.log(green('  ✓ 发布索引'), cyan(`index.json (${index.articles.length} 篇)`));
  return index;
}

async function syncAll() {
  console.log('');
  console.log(green('⟳ 全量同步开始...'));
  const files = await listMarkdown(POSTS_DIR);
  console.log(dim(`  发现 ${files.length} 篇 Markdown`));

  // 1. 上传所有文章
  await mapLimit(files, 8, (f) => syncArticleFile(f));

  // 2. 重建并发布索引
  await publishIndex();

  // 3. 清理 bucket 中已不存在的文章（删除/重命名后残留）
  const remoteKeys = await listBucketKeys('posts/');
  const localKeys = new Set(files.map((f) => `posts/${toPosixPath(relative(POSTS_DIR, f))}`));
  const stale = remoteKeys.filter((k) => !localKeys.has(k));
  if (stale.length > 0) {
    console.log(dim(`  清理 ${stale.length} 个已删除的对象`));
    await mapLimit(stale, 8, (k) => deleteObject(k));
  }

  console.log(green('✅ 全量同步完成'));
}

// ── 监听模式 ─────────────────────────────────────────
async function handleChange(absPath, isDeletion) {
  if (!absPath.endsWith('.md')) return;
  const rel = toPosixPath(relative(POSTS_DIR, absPath));
  if (rel.startsWith('.') || rel.includes('/.')) return; // 忽略隐藏文件

  try {
    if (isDeletion || (await stat(absPath)).isFile() === false) {
      await removeArticleFile(absPath);
    } else {
      await syncArticleFile(absPath);
    }
    await publishIndex();
  } catch (err) {
    console.error(red(`  ✗ 同步失败: ${rel}`), err.message);
  }
}

function startWatch() {
  console.log('');
  console.log(green('╔══════════════════════════════════════════╗'));
  console.log(green('║') + '   📝 R2 Content Sync 已启动                ' + green('║'));
  console.log(green('╠══════════════════════════════════════════╣'));
  console.log(green('║') + `   监听目录: ${cyan(POSTS_DIR)}` + green('║'));
  console.log(green('║') + `   目标 bucket: ${cyan(BUCKET)}` + green('║'));
  console.log(green('╠══════════════════════════════════════════╣'));
  console.log(green('║') + '   按 Ctrl+C 停止                          ' + green('║'));
  console.log(green('╚══════════════════════════════════════════╝'));
  console.log('');

  let debounceTimer = null;
  const pending = new Map(); // path -> isDeletion

  const flush = async () => {
    const batch = [...pending.entries()];
    pending.clear();
    for (const [path, isDeletion] of batch) {
      await handleChange(path, isDeletion);
    }
  };

  try {
    watch(POSTS_DIR, { recursive: true }, (_eventType, filename) => {
      if (!filename || !filename.endsWith('.md')) return;
      if (filename.startsWith('.') || filename.includes('/.')) return;
      const fullPath = resolve(POSTS_DIR, filename);
      // rename 会先触发 rename 事件，再触发 rename/change；这里用 stat 探测是否为删除
      pending.set(fullPath, false);
      console.log(cyan(`  ● 检测到变更: ${filename}`));
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        // 逐个探测：文件不存在视为删除
        for (const p of pending.keys()) {
          try {
            await stat(p);
          } catch {
            pending.set(p, true);
          }
        }
        console.log(yellow('\n⟳ 开始同步...'));
        await flush();
        console.log(dim('─'.repeat(40)));
      }, 2000);
    });
  } catch (err) {
    console.error(red('无法启动文件监听:'), err.message);
    process.exit(1);
  }
}

// ── 入口 ─────────────────────────────────────────
const cmd = process.argv[2] || 'sync';
if (cmd === 'sync') {
  syncAll().catch((err) => {
    console.error(red('同步失败:'), err.message);
    process.exit(1);
  });
} else if (cmd === 'watch') {
  startWatch();
} else {
  console.error(`未知命令: ${cmd}（可用: sync / watch）`);
  process.exit(1);
}

process.on('SIGINT', () => {
  console.log(dim('\n\n👋 R2 Content Sync 已停止'));
  process.exit(0);
});
