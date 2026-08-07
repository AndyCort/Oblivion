/**
 * Oblivion 内容 API（Cloudflare Worker + D1）
 *
 * 公开只读接口（任何人可访问，不含任何存储路径）：
 *   GET /api/articles        文章列表（元数据，不含正文）
 *   GET /api/articles/:id    单篇文章（含正文）
 *
 * 内部发布接口（需 x-publish-secret 请求头，仅供本地发布脚本/Obsidian 插件调用）：
 *   POST /api/publish        全量 upsert（已解析的文章对象）
 *   POST /api/publish-raw    全量发布原始 Markdown 文件（解析和 ID 映射都在这里完成）
 */

import { parse as parseYaml } from 'yaml';

export interface Env {
  DB: D1Database;
  PUBLISH_SECRET?: string;
}

const JSON_FIELDS = ['title', 'summary', 'content', 'tags'] as const;

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-publish-secret',
};

function parseJsonField(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function rowToArticle(row: Record<string, unknown>): Record<string, unknown> {
  const article: Record<string, unknown> = { ...row };
  // source_path 是内部字段，绝不出现在任何公开响应里
  delete article.source_path;
  for (const field of JSON_FIELDS) {
    if (article[field] != null) article[field] = parseJsonField(article[field]);
  }
  article.pinned = !!article.pinned;
  return article;
}

function json(data: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...extra,
    },
  });
}

async function ensureSchema(db: D1Database): Promise<void> {
  await db
    .prepare(
      'CREATE TABLE IF NOT EXISTS articles (' +
        'id TEXT PRIMARY KEY, ' +
        'source_path TEXT, ' +
        "title TEXT NOT NULL DEFAULT '', " +
        "summary TEXT NOT NULL DEFAULT '', " +
        "author TEXT NOT NULL DEFAULT '', " +
        "date TEXT NOT NULL DEFAULT '', " +
        "tags TEXT NOT NULL DEFAULT '[]', " +
        "cover TEXT NOT NULL DEFAULT '', " +
        'pinned INTEGER NOT NULL DEFAULT 0, ' +
        "content TEXT NOT NULL DEFAULT '', " +
        'chars INTEGER NOT NULL DEFAULT 0, ' +
        "updated_at TEXT NOT NULL DEFAULT (datetime('now'))" +
        ')',
    )
    .run();
  await db
    .prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_source_path ON articles (source_path)')
    .run();
}

const CHUNK = 50;

// 只对对象/数组做 JSON 编码，纯字符串原样存储，避免多出引号
function storeField(value: unknown): string {
  if (value && typeof value === 'object') return JSON.stringify(value);
  return String(value ?? '');
}

async function upsertArticles(db: D1Database, articles: Array<Record<string, unknown>>): Promise<number> {
  const stmt = db.prepare(`
    INSERT INTO articles (id, source_path, title, summary, author, date, tags, cover, pinned, content, chars, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      source_path = excluded.source_path,
      title = excluded.title,
      summary = excluded.summary,
      author = excluded.author,
      date = excluded.date,
      tags = excluded.tags,
      cover = excluded.cover,
      pinned = excluded.pinned,
      content = excluded.content,
      chars = excluded.chars,
      updated_at = datetime('now')
  `);

  let written = 0;
  for (let i = 0; i < articles.length; i += CHUNK) {
    const batch = articles.slice(i, i + CHUNK).map((a) =>
      stmt.bind(
        String(a.id ?? ''),
        a.sourcePath ? String(a.sourcePath) : null,
        storeField(a.title),
        storeField(a.summary),
        String(a.author ?? ''),
        String(a.date ?? ''),
        storeField(Array.isArray(a.tags) ? a.tags : []),
        String(a.cover ?? ''),
        a.pinned ? 1 : 0,
        storeField(a.content),
        Number(a.chars ?? 0),
      ),
    );
    const results = await db.batch(batch);
    written += results.reduce((n, r) => n + r.meta.changes, 0);
  }
  return written;
}

// ── 原始 Markdown 解析（逻辑只维护在 Worker 这一份） ──
const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
const LOCALIZED_SECTION_REGEX = /<!--\s*([a-zA-Z-]+)\s*-->([\s\S]*?)<!--\s*\/\s*[a-zA-Z-]+\s*-->/g;

function parseFrontmatter(rawContent: string): { frontmatter: Record<string, unknown>; content: string } {
  const fmMatch = rawContent.match(FRONTMATTER_REGEX);
  if (!fmMatch) return { frontmatter: {}, content: rawContent };
  try {
    return { frontmatter: (parseYaml(fmMatch[1]) || {}) as Record<string, unknown>, content: fmMatch[2] };
  } catch {
    return { frontmatter: {}, content: fmMatch[2] };
  }
}

function keepLocalized(field: unknown): Record<string, string> | null {
  if (field && typeof field === 'object') {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(field)) {
      if (typeof value === 'string' && value.trim()) out[key] = value;
    }
    return Object.keys(out).length > 0 ? out : null;
  }
  return null;
}

function splitLocalizedContent(body: string): Record<string, string> | null {
  const sections: Record<string, string> = {};
  let found = false;
  let match: RegExpExecArray | null;
  const regex = new RegExp(LOCALIZED_SECTION_REGEX.source, 'g');
  while ((match = regex.exec(body)) !== null) {
    found = true;
    const lang = match[1].toLowerCase();
    const key = lang === 'zh' || lang === 'zh-cn' ? 'zh' : lang === 'en' || lang === 'en-us' ? 'en' : '';
    if (key && !(key in sections)) sections[key] = match[2].trim();
  }
  return found ? sections : null;
}

function asString(field: unknown, fallback: string): string {
  return typeof field === 'string' && field.trim() ? field : fallback;
}

function buildArticleFields(sourcePath: string, raw: string): Record<string, unknown> {
  const { frontmatter, content: body } = parseFrontmatter(raw);
  let filename = sourcePath.split('/').pop()?.replace(/\.md$/, '') || sourcePath;
  try {
    filename = decodeURIComponent(filename);
  } catch {
    // 文件名含非法转义时保留原样
  }

  return {
    sourcePath,
    title: keepLocalized(frontmatter.title) ?? asString(frontmatter.title, filename),
    summary: keepLocalized(frontmatter.summary) ?? asString(frontmatter.summary, ''),
    author: typeof frontmatter.author === 'string' ? frontmatter.author : '',
    date: typeof frontmatter.date === 'string' ? frontmatter.date : new Date().toISOString().split('T')[0],
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    cover: typeof frontmatter.cover === 'string' ? frontmatter.cover : '',
    pinned: !!frontmatter.pinned || !!frontmatter.top,
    content: keepLocalized(frontmatter.content) ?? splitLocalizedContent(body) ?? body,
    chars: body.length,
  };
}

async function handlePublishRaw(env: Env, request: Request): Promise<Response> {
  if (!env.PUBLISH_SECRET || request.headers.get('x-publish-secret') !== env.PUBLISH_SECRET) {
    return json({ error: 'Forbidden' }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const files = Array.isArray(body.files)
    ? (body.files as Array<{ path?: string; content?: string }>)
    : [];
  const deletedPaths = Array.isArray(body.deletedPaths)
    ? (body.deletedPaths as string[]).map(String)
    : [];
  // fullSync=true（默认）：files 之外的旧文章全部清理（全量同步语义）
  // fullSync=false：只删除 deletedPaths 里列出的文章（增量同步语义）
  const fullSync = body.fullSync !== false;

  if (files.length === 0 && deletedPaths.length === 0) {
    return json({ ok: true, published: 0, deleted: 0 });
  }

  await ensureSchema(env.DB);

  // 读取已有的 source_path → id 映射，保证文章 ID 跨发布稳定
  const rows = await env.DB
    .prepare('SELECT id, source_path FROM articles WHERE source_path IS NOT NULL')
    .all<{ id: string; source_path: string }>();
  const idByPath = new Map<string, string>();
  for (const row of rows.results ?? []) idByPath.set(row.source_path, row.id);

  const articles: Array<Record<string, unknown>> = [];
  for (const file of files) {
    const path = file.path || '';
    if (!path.endsWith('.md')) continue;
    const id = idByPath.get(path) || crypto.randomUUID();
    articles.push({ id, ...buildArticleFields(path, String(file.content ?? '')) });
  }

  const published = await upsertArticles(env.DB, articles);
  const deleted = fullSync
    ? await deleteMissing(env.DB, articles.map((a) => String(a.id)))
    : await deleteByPaths(env.DB, deletedPaths);
  return json({ ok: true, published, deleted });
}

async function deleteMissing(db: D1Database, activeIds: string[]): Promise<number> {
  const existing = await db.prepare('SELECT id FROM articles').all<{ id: string }>();
  const keep = new Set(activeIds);
  const stale = (existing.results || []).map((r) => r.id).filter((id) => !keep.has(id));

  let deleted = 0;
  for (let i = 0; i < stale.length; i += CHUNK) {
    const chunkIds = stale.slice(i, i + CHUNK);
    const placeholders = chunkIds.map(() => '?').join(',');
    const res = await db
      .prepare(`DELETE FROM articles WHERE id IN (${placeholders})`)
      .bind(...chunkIds)
      .run();
    deleted += res.meta.changes;
  }
  return deleted;
}

async function deleteByPaths(db: D1Database, paths: string[]): Promise<number> {
  let deleted = 0;
  for (let i = 0; i < paths.length; i += CHUNK) {
    const chunkPaths = paths.slice(i, i + CHUNK);
    const placeholders = chunkPaths.map(() => '?').join(',');
    const res = await db
      .prepare(`DELETE FROM articles WHERE source_path IN (${placeholders})`)
      .bind(...chunkPaths)
      .run();
    deleted += res.meta.changes;
  }
  return deleted;
}

async function handleList(db: D1Database): Promise<Response> {
  const { results } = await db
    .prepare(
      `SELECT id, title, summary, author, date, tags, cover, pinned, chars, updated_at
       FROM articles
       ORDER BY pinned DESC, date DESC, id ASC`,
    )
    .all<Record<string, unknown>>();
  return json({ articles: results.map(rowToArticle) }, 200, { 'Cache-Control': 'public, max-age=300' });
}

async function handleGet(db: D1Database, id: string): Promise<Response> {
  const row = await db.prepare('SELECT * FROM articles WHERE id = ?').bind(id).first<Record<string, unknown>>();
  if (!row) return json({ error: 'Article not found' }, 404);
  return json(rowToArticle(row), 200, { 'Cache-Control': 'public, max-age=300' });
}

async function handlePublish(env: Env, request: Request): Promise<Response> {
  if (!env.PUBLISH_SECRET || request.headers.get('x-publish-secret') !== env.PUBLISH_SECRET) {
    return json({ error: 'Forbidden' }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const articles = Array.isArray(body.articles) ? (body.articles as Array<Record<string, unknown>>) : [];
  const activeIds = Array.isArray(body.activeIds)
    ? (body.activeIds as string[]).map(String)
    : articles.map((a) => String(a.id ?? ''));

  await ensureSchema(env.DB);
  const published = await upsertArticles(env.DB, articles);
  const deleted = await deleteMissing(env.DB, activeIds);
  return json({ ok: true, published, deleted });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      const { pathname } = new URL(request.url);

      if (request.method === 'GET' && pathname === '/api/articles') {
        return await handleList(env.DB);
      }

      const match = pathname.match(/^\/api\/articles\/([^/]+)$/);
      if (match && request.method === 'GET') {
        return await handleGet(env.DB, decodeURIComponent(match[1]));
      }

      if (request.method === 'POST' && pathname === '/api/publish') {
        return await handlePublish(env, request);
      }

      if (request.method === 'POST' && pathname === '/api/publish-raw') {
        return await handlePublishRaw(env, request);
      }

      return json({ error: 'Not found' }, 404);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('handler error:', message, err instanceof Error ? (err.stack || '') : '');
      return json({ error: message }, 500);
    }
  },
};
